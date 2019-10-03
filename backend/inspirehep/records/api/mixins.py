import hashlib
import re
import uuid
from io import BytesIO

import structlog
from fs.errors import ResourceNotFoundError
from fs.opener import fsopen
from invenio_db import db
from invenio_files_rest.models import ObjectVersion
from sqlalchemy import func

from inspirehep.records.models import RecordCitations

LOGGER = structlog.getLogger()

FILES_API_PREFIX = "/api/files"


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


class FilesMixin:
    def add_file(self, url, original_url=None, filename=None, **kwargs):
        """Downloads file from url and saves it with `filename` as a proper name.

        If filename is not provided ti will be resolved in the following way:
            - Use filename if it's provided
            - Check if key looks as proper filename, if yes then use it.
            - if original_url is provided and last part of it (after last `/`)
              looks like proper filename then use it
            - as last resort use last part of `url` (after last `/`)

        Args:
            url (string): Url to a file, or to local api
            filename (string): Proper name of the file.
            original_url (string): URL from which this document was downloaded

        Keyword Args:
            description (string): works for documents and figures
            fulltext (bool): works for documents only
            hidden (bool): works for documents only
            material (string): works for documents and figures
            caption (string): works for facets only
            key (string): Can contain name of the file (compatibility with inspire-next)

        Returns:
            dict: Metadata for file
        """
        key = self.find_and_add_file(url, original_url)
        if not key:
            raise FileNotFoundError(f"File `{url}|{original_url}` not found")

        if not filename:
            LOGGER.debug("filename not provided", url=url)
            original_key = kwargs.get("key")

            if original_key and self.is_filename(original_key):
                LOGGER.debug("Using original key as filename")
                filename = original_key

            if not filename and original_url:
                LOGGER.debug(
                    "Processing original_url to resolve filename", url=original_url
                )
                try:
                    filename = self.split_url(original_url)["file"]
                except ValueError:
                    pass

            if not filename:
                LOGGER.debug("Processing url to resolve filename", url=url)
                try:
                    filename = self.split_url(url)["file"]
                except ValueError:
                    LOGGER.warning("Cannot resolve filename, using key instead")
                    filename = key

        LOGGER.debug(f"Using {filename} as filename")
        self.files[key]["filename"] = filename

        return {
            "key": key,
            "filename": filename,
            "original_url": url if not original_url else original_url,
            "url": f"{FILES_API_PREFIX}/{self.files[key].bucket_id}/{key}",
        }

    def find_and_add_file(self, url, original_url=None):
        """Finds proper url (url or original_url) and method to download file.

        Args:
            url (str): Local or remote path to a file
            original_url (str): Local or remote path to a file

        Returns:
            str: Key of downloaded file, or `None` if file was not found
        """
        urls = [_url for _url in [url, original_url] if _url]
        key = None
        for _url in urls:
            try:
                if _url.startswith(FILES_API_PREFIX):
                    LOGGER.debug("file is local", url=url)
                    key = self.download_file_from_local_storage(_url)
            except FileNotFoundError:
                LOGGER.warning("Cannot copy from local storage", url=url)
        if not key:
            for _url in urls:
                try:
                    if _url.startswith("http"):
                        LOGGER.debug("file is web based.", url=url)
                        key = self.download_file_from_url(_url)
                except ResourceNotFoundError:
                    LOGGER.warning("Cannot download file", url=url)
        return key

    def download_file_from_local_storage(self, url, **kwargs):
        """Opens local file with ObjectVersion API.
        Callculates it's hash and returns hash of the file.

        Args:
            url (str): Local url which starts with /api/files/

        Returns:
            str: key(sha-1) of downloaded file

        Examples:
            >>> url = '/api/files/261926f6-4923-458e-adb0/207611e7bf8a83f0739bb2e'
            >>> self.download_file_from_local_storage(url)
                '207611e7bf8a83f0739bb2e'
        """
        url_splited = self.split_url(url)
        try:
            file_ = self.find_local_file(
                key=url_splited["file"], bucket_id=url_splited["bucket"]
            )
        except ValueError:
            LOGGER.exception("Cannot download file from local storage", url=url_splited)
            file_ = None

        if not file_:
            raise FileNotFoundError(f"{url} is not a valid file in local storage!")
        file_hash = None
        if self.is_hash(url_splited["file"]):
            file_hash = url_splited["file"]
        return self.copy_local_file(file_, file_hash)

    def download_file_from_url(self, url):
        """Downloads file and calculates hash for it

        If everything is ok then adds it to files in current record.
        If file with same hash already found in db, tries to use this one
        instead of creating duplicate (uses `ObjectVersion.copy()` method)

        Args:
            url (str): Local or remote url/filepath

        Returns:
            str: key(sha-1) of downloaded file

        Raises:
            ValueError: can be raised in `self.hash_data` method if no data is provided

        Example:
            >>> self.download_file_from_url('http://example.com/url_to_file.pdf')
            '207611e7bf8a83f0739bb2e16a1a7cf0d585fb5f'
        """
        stream = fsopen(url, mode="rb")
        # TODO: change to stream.read() when fs will be updated to >= 2.0
        # As HTTPOpener is not working with size = -1
        # (and read() method sets this size as default)
        # This is workaround until we will update to fs >2.0
        data = stream._f.wrapped_file.read()
        key = self.hash_data(data=data)
        if key in self.files.keys:
            LOGGER.debug("File already attached to record", key=key, uuid=self.id)
            return key

        file_ = self.find_local_file(key=key)
        new_key = None

        if file_:
            LOGGER.debug("Same file found locally, trying to copy", uuid=self.id)
            try:
                new_key = self.copy_local_file(file_, key)
            except (ValueError, AttributeError):
                pass
        if not new_key:
            LOGGER.debug("Adding file to record", key=key, uuid=self.id)
            self.files[key] = BytesIO(data)
        return key

    def find_local_file(self, key, bucket_id=None):
        """Tries to find proper file.

        If `key` is a proper hash and there is no bucket_id it will take first one.
        Allows to search for same files and prevents of creating duplicates.

        Args:
            key (str): filename or hash
            bucket_id: proper bucket uuid

        Returns:
            ObjectVersion: found file, or none if not found.
        """
        if not bucket_id and not self.is_hash(key):
            return None
        if not bucket_id:
            return ObjectVersion.query.filter(
                ObjectVersion.key == key, ObjectVersion.is_head.is_(True)
            ).first()
        return ObjectVersion.get(bucket=bucket_id, key=key)

    def verify_file(self, file_, file_hash):
        """Verifies if `file` instance is correct for specified `hash`.

        Args:
            file (ObjectVersion): File to verify
            file_hash (str): Hash of the file

        Returns:
            str: Returns hash itself it it's matching the file, None otherwise
        """
        calculated_hash = self.hash_data(file_instance=file_)
        if calculated_hash == file_hash:
            return file_hash
        return None

    def copy_local_file(self, file_, original_key=None):
        """Copies file from local storage from `file` to this record.

        Verifies current hash with the `original_key` it is provided.

        Args:
            file (ObjectVersion): file instance form which data should be copied
            original_key (str): hash to verify

        Returns:
            str: hash for copied file

        Raises:
            ValueError: when hash to verify was provided and
                it didn't match to file hash
        """
        if original_key:
            key = self.verify_file(file_, original_key)
            if not key:
                raise ValueError("File verifiaction failed! Hashes do not match!")
        else:  # Compatibility with old way of holding files
            key = self.hash_data(file_instance=file_)

        if key not in self.files.keys:
            LOGGER.debug("Adding file to record", key=key, uuid=self.id)
            file_.copy(bucket=self.files.bucket.id, key=key)
            self["_files"] = self.files.dumps()
        else:
            LOGGER.debug("File already attached to record", key=key, uuid=self.id)
        return key

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

        raise ValueError("Data for hashing cannot be empty!")

    @staticmethod
    def is_filename(test_str):
        """Checks if provided string looks like proper filename.

        Args:
            test_str: String for testing

        Returns:
            bool: True if filename looks valid, False otherwise.

        Raises:
            re.error: from re.match
        """
        match = re.match(
            r"^([a-zA-Z0-9_]+)\.(?!\.)([a-zA-Z0-9]{1,5})(?<!\.)$", test_str
        )
        if match and match.start() == 0:
            return True
        return False

    @staticmethod
    def is_hash(test_str):
        """Very naive hash check.

        Args:
            test_str (str): tested string

        Returns:
            bool: True if 'test_str' looks like hash, False otherwise.

        Raises:
            TypeError: from len() function
        """
        if test_str and len(test_str) == 40:
            return True
        return False

    @staticmethod
    def is_bucket_uuid(test_str):
        """Naive method to check if `test_str` can be ``bucket_uuid``.

        It just wraps uuid.UUID('uuid_str') class to be sure that no exception is thrown.

        Args:
            test_str (str): string to test

        Returns:
            bool: `True` if `test_str` looks like bucket_uuid, False otherwise.
        """
        try:
            uuid.UUID(test_str)
            return True
        except (ValueError, TypeError):
            return False

    @classmethod
    def split_url(cls, url):
        """Tries to split url to grab `bucket_id` and `filename` / `file_hash`.

        Args:
            url (str): Url

        Returns:
            dict: dictionary containing:
                ``bucket`` (str): id of the bucket
                ``file`` (str): filename or hash
        Raises:
            ValueError: When it's not possible to parse url properly

        Examples:
            >>> InspireRecord.split_url('/api/files/261926f6-4923-458e-adb0/
                207611e7bf8a83f0739bb2e')
            {
                'bucket': '261926f6-4923-458e-adb0',
                'file': '207611e7bf8a83f0739bb2e',
            }
            >>> InspireRecord.split_url('https://some_url.com/some/path/to/file.txt')
            {
                'bucket': None,
                'file': 'file.txt'
            }
        """

        url_splited = url.split("://")[-1].split("/")
        if len(url_splited) < 2:
            raise ValueError(f"{url} does not contain bucket and/or file part")

        if cls.is_hash(url_splited[-1]) or cls.is_filename(url_splited[-1]):
            file_ = url_splited[-1]
        else:
            raise ValueError(f"{url} does not contain filename or file hash")

        if not url.startswith("http"):
            if url.startswith(FILES_API_PREFIX) and cls.is_bucket_uuid(url_splited[-2]):
                bucket = url_splited[-2]
            else:
                raise ValueError("Missing bucket id")
        else:
            bucket = None

        return {"bucket": bucket, "file": file_}
