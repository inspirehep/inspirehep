import hashlib
import uuid
from collections import OrderedDict
from io import BytesIO

import requests
import structlog
from flask import current_app
from invenio_db import db
from invenio_files_rest.models import Bucket, ObjectVersion
from invenio_records.errors import MissingModelError
from invenio_records_files.api import FilesIterator as InvenioFilesIterator
from invenio_records_files.models import RecordsBuckets
from sqlalchemy import func

from inspirehep.records.errors import DownloadFileError
from inspirehep.records.models import RecordCitations

LOGGER = structlog.getLogger()


def requests_retry_session(retries=3):
    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


class CitationMixin:
    def _citation_query(self):
        """Prepares query with all records which cited this one
        Returns:
            query: Query containing all citations for this record
        """
        return RecordCitations.query.filter_by(cited_id=self.id)

    @property
    def citation_count(self):
        """Gives citation count number
        Returns:
            int: Citation count number for this record if it is literature or data
            record.
        """
        return self._citation_query().count()

    @property
    def citations_by_year(self):
        """Return the number of citations received per year for the current record.
        Returns:
            dict: citation summary for this record.
        """
        db_query = self._citation_query()
        db_query = db_query.with_entities(
            func.count(RecordCitations.citation_date).label("sum"),
            func.date_trunc("year", RecordCitations.citation_date).label("year"),
        )
        db_query = db_query.group_by("year").order_by("year")
        return [{"year": r.year.year, "count": r.sum} for r in db_query.all() if r.year]

    def is_superseded(self):
        """Checks if record is superseded
        Returns:
            bool: True if is superseded, False otherwise
        """
        return "successor" in self.get_value("related_records.relation", "")

    def update_refs_in_citation_table(self, save_every=100):
        """Updates all references in citation table.
        First removes all references (where citer is this record),
        then adds all from the record again.
        Args:
            save_every (int): How often data should be saved into session.
            One by one is very inefficient, but so is 10000 at once.
        """
        RecordCitations.query.filter_by(citer_id=self.id).delete()
        if (
            self.is_superseded()
            or self.get("deleted")
            or self.pid_type not in ["lit"]
            or "Literature" not in self["_collections"]
        ):
            # Record is not eligible to cite
            LOGGER.info(
                "Record's is not eligible to cite.",
                recid=self.get("control_number"),
                uuid=str(self.id),
            )
            return
        records_pids = self.get_linked_pids_from_field("references.record")
        # Limit records to literature and data as only this types can be cited
        proper_records_pids = [
            rec_pid for rec_pid in records_pids if rec_pid[0] in ["lit", "dat"]
        ]
        LOGGER.info(
            f"Record has {len(proper_records_pids)} linked references",
            recid=self.get("control_number"),
            uuid=str(self.id),
        )
        records_uuids = self.get_records_ids_by_pids(proper_records_pids)
        referenced_records = set()
        references_waiting_for_commit = []
        citation_date = self.earliest_date
        for reference in records_uuids:
            if reference not in referenced_records:
                referenced_records.add(reference)
                references_waiting_for_commit.append(
                    RecordCitations(
                        citer_id=self.model.id,
                        cited_id=reference,
                        citation_date=citation_date,
                    )
                )
            if len(references_waiting_for_commit) >= save_every:
                db.session.bulk_save_objects(references_waiting_for_commit)
                references_waiting_for_commit = []
        if references_waiting_for_commit:
            db.session.bulk_save_objects(references_waiting_for_commit)
        LOGGER.info(
            "Record citations updated",
            recid=self.get("control_number"),
            uuid=str(self.id),
        )


class FilesIterator(InvenioFilesIterator):
    def __init__(self, record, bucket=None, file_cls=None):
        super().__init__(record, bucket=bucket, file_cls=file_cls)
        if self.bucket:
            objects = ObjectVersion.get_by_bucket(self.bucket).all()
            self.filesmap = OrderedDict(
                [(f.key, self.file_cls(objects[0], {}).dumps()) for f in objects]
            )
        else:
            self.filesmap = OrderedDict([])


class FilesMixin:
    files_iter_cls = FilesIterator

    @classmethod
    def create_bucket(cls, data=None, location=None, storage_class=None):
        if not location:
            location = current_app.config["RECORDS_DEFAULT_FILE_LOCATION_NAME"]
        if not storage_class:
            storage_class = current_app.config["RECORDS_DEFAULT_STORAGE_CLASS"]
        return Bucket.create(location=location, storage_class=storage_class)

    def create_bucket_and_link_to_record(self):
        bucket = self.create_bucket()
        if bucket:
            self.dump_bucket(self, bucket)
            RecordsBuckets.create(record=self.model, bucket=bucket)
            self._bucket = bucket
        return bucket

    def delete_removed_files(self, keys):
        for key in list(self.files.keys):
            if key not in keys:
                try:
                    del self.files[key]
                except KeyError:
                    LOGGER.error(
                        "Key is already deleted",
                        uuid=self.id,
                        key=key,
                        files_keys=self.files.keys,
                    )
        self.files.flush()

    @property
    def files(self):
        if self.model is None:
            raise MissingModelError()
        bucket = self.get_bucket()
        return self.files_iter_cls(self, bucket=bucket, file_cls=self.file_cls)

    def add_file(self, url, original_url=None, key=None, filename=None, **kwargs):
        if self.local_url(url):
            LOGGER.info("Local url trying to copy existing file", uuid=self.id, url=url)
            bucket, key = self.find_bucket_and_key_from_local_url(url)
            key = self.add_local_file(key, bucket)
            if not key and original_url:
                LOGGER.debug(
                    "Failed to match the local file, trying to download file from original_url",
                    url=url,
                    original_url=original_url,
                )
                key = self.add_file_from_url(original_url)
        else:
            LOGGER.info("Downloading external url", uuid=self.id, url=url)
            key = self.add_file_from_url(url)

        if not key:
            raise DownloadFileError(f"{url} cannot be downloaded")

        if not filename:
            filename = self.get_filiname_from_original_url_or_url_or_key(
                original_url, url, key
            )

        self.files[key]["filename"] = filename
        self.files.flush()

        data = {"key": key, "filename": filename, "url": self.get_file_url(key)}
        original_url = url if not original_url else original_url
        if not self.local_url(original_url):
            data["original_url"] = original_url
        return data

    def add_local_file(self, key, bucket=None):
        file_object = self.get_file_object(key, bucket)

        if not file_object:
            LOGGER.info("Local file not found", uuid=self.id, key=key, bucket=bucket)
            return None

        key_hashed = key if self.is_hash(key) else None

        if not self.verify_hash_of_files(file_object, key_hashed):
            key_hashed = self.hash_data(file_instance=file_object)

        if key_hashed not in self.files.keys:
            file_object.copy(bucket=self.files.bucket.id, key=key_hashed)
        self.files.flush()
        return key_hashed

    def add_file_from_url(self, url):
        max_retries = current_app.config.get("FILES_DOWNLOAD_MAX_RETRIES", 3)
        data = requests_retry_session(retries=max_retries).get(url, stream=True).content
        key_hashed = self.hash_data(data=data)
        if key_hashed in self.files.keys:
            LOGGER.debug("File already exists", key=key_hashed)
            return key_hashed

        local_file_key_hashed = self.add_local_file(key_hashed)

        if not local_file_key_hashed:
            self.files[key_hashed] = BytesIO(data)
        self.files.flush()
        return key_hashed

    def get_file_url(self, key):
        api_prefix = current_app.config["FILES_API_PREFIX"]
        return f"{api_prefix}/{self.files[key].bucket_id}/{key}"

    def get_file_object(self, key, bucket_id=None):
        if not bucket_id:
            return ObjectVersion.query.filter(
                ObjectVersion.key == key,
                ObjectVersion.is_head.is_(True),
                ObjectVersion.file_id.isnot(None),
            ).first()

            return None

        return ObjectVersion.get(bucket=bucket_id, key=key)

    def get_filiname_from_original_url_or_url_or_key(self, original_url, url, key):
        filename = None
        if original_url:
            filename = self.find_filename_from_url(original_url)
        elif url:
            filename = self.find_filename_from_url(url)
        return filename or key

    def get_bucket(self):
        if self.bucket:
            return self.bucket
        return self.create_bucket_and_link_to_record()

    def verify_hash_of_files(self, file_object, file_hash):
        calculated_hash = self.hash_data(file_instance=file_object)
        return calculated_hash == file_hash

    @staticmethod
    def find_bucket_and_key_from_local_url(url):
        bucket, key = url.split("/")[-2:]
        if not FilesMixin.is_bucket_uuid(bucket) or not key:
            raise ValueError(f"{url} Not a valid local url.")
        return bucket, key

    @staticmethod
    def find_filename_from_url(url):
        try:
            return url.split("/")[-1]
        except AttributeError:
            return None

    @staticmethod
    def local_url(url):
        api_prefix = current_app.config["FILES_API_PREFIX"]
        return url.startswith(api_prefix)

    @staticmethod
    def hash_data(data=None, file_instance=None):
        """Hashes data/file with selected algorithm.

        Note:
            `file_instance` takes precedence before `data` (if it's provided)

        Args:
            data (bytes): data bytes
            file_instance (ObjectVersion): file instance

        Returns:
            str: Hash of the file_instance/data

        Raises:
            ValueError: when `data` AND `file_instance` are empty
        """
        if file_instance:
            file_stream = file_instance.file.storage().open()
            data = file_stream.read()

        if data:
            return hashlib.sha1(data).hexdigest()

        raise ValueError("Data for hashing cannot be empty")

    @staticmethod
    def is_bucket_uuid(test_str):
        """Naive method to check if `test_str` can be ``bucket_uuid``."""
        try:
            uuid.UUID(test_str)
            return True
        except (ValueError, TypeError):
            return False

    @staticmethod
    def is_hash(test_str):
        return test_str and len(test_str) == 40
