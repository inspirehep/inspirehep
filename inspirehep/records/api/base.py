# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""
import hashlib
import importlib
import json
import logging
import re
import uuid
from io import BytesIO

from flask import current_app
from flask_celeryext.app import current_celery_app
from fs.errors import ResourceNotFoundError
from fs.opener import fsopen
from inspire_dojson.utils import strip_empty_values
from inspire_schemas.api import validate as schema_validate
from inspire_utils.record import get_value
from invenio_db import db
from invenio_files_rest.models import Bucket, Location, ObjectVersion
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier, RecordIdentifier
from invenio_records.errors import MissingModelError
from invenio_records.models import RecordMetadata
from invenio_records_files.api import Record
from invenio_records_files.models import RecordsBuckets
from sqlalchemy import cast, not_, or_, tuple_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.errors import MissingSerializerError
from inspirehep.records.indexer.base import InspireRecordIndexer

logger = logging.getLogger(__name__)


class InspireQueryBuilder(object):
    def __init__(self):
        self._query = RecordMetadata.query

    def not_deleted(self):
        expression = or_(
            not_(type_coerce(RecordMetadata.json, JSONB).has_key("deleted")),
            not_(RecordMetadata.json["deleted"] == cast(True, JSONB)),
        )
        return self.filter(expression)

    def by_collections(self, collections):
        expression = type_coerce(RecordMetadata.json, JSONB)["_collections"].contains(
            collections
        )
        return self.filter(expression)

    def filter(self, expression):
        self._query = self._query.filter(expression)
        return self

    def no_duplicates(self):
        self._query = self._query.distinct(RecordMetadata.json["control_number"])
        return self

    def query(self):
        return self._query


class InspireRecord(Record):
    """Inspire Record."""

    pid_type = None
    es_serializer = None
    ui_serializer = None

    @staticmethod
    def strip_empty_values(data):
        return strip_empty_values(data)

    @staticmethod
    def mint(record_uuid, data):
        pass

    def validate(self):
        schema_validate(self)

    @staticmethod
    def query_builder():
        return InspireQueryBuilder()

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
        else:
            raise ValueError("Data for hashing cannot be empty!")

    @staticmethod
    def is_filename(test_str):
        """Checks if provided string looks like proper filename

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
        """Very naive hash check

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
        """Naive method to check if `test_str` can be bucket_uuid

        It just wraps uuid.UUID('uuid_str') class to be
        sure that no exception is thrown.

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
        """Tries to split url to grab `bucket_id` and `filename` / `file_hash`

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
        API_PATH = "/api/files/"

        url_splited = url.split("://")[-1].split("/")
        if len(url_splited) < 2:
            raise ValueError(f"{url} does not contain bucket and/or file part")

        if cls.is_hash(url_splited[-1]):
            file = url_splited[-1]
            logger.debug("'%s' contains hash: '%s'", url, file)
        elif cls.is_filename(url_splited[-1]):
            file = url_splited[-1]
            logger.debug("'%s' contains filename: '%s'", url, file)
        else:
            raise ValueError("'%s' does not contain filename or file hash!", url)

        if not url.startswith("http"):
            if url.startswith(API_PATH) and cls.is_bucket_uuid(url_splited[-2]):
                bucket = url_splited[-2]
                logger.debug("'%s' contains bucket_id: '%s'", url, bucket)
            else:
                raise ValueError("Missing bucket id!")
        else:
            bucket = None

        return {"bucket": bucket, "file": file}

    @classmethod
    def get_uuid_from_pid_value(cls, pid_value, pid_type=None):
        if not pid_type:
            pid_type = cls.pid_type
        pid = PersistentIdentifier.get(pid_type, pid_value)
        return pid.object_uuid

    @classmethod
    def get_record_by_pid_value(cls, pid_value, pid_type=None):
        if not pid_type:
            pid_type = cls.pid_type
        record_uuid = cls.get_uuid_from_pid_value(pid_value, pid_type)
        return cls.get_record(record_uuid)

    @classmethod
    def get_subclasses(cls):
        records_map = {}
        if cls.pid_type:
            records_map[cls.pid_type] = cls
        for _cls in cls.__subclasses__():
            records_map[_cls.pid_type] = _cls
        return records_map

    @classmethod
    def get_record(cls, id_, with_deleted=False):
        record = super().get_record(str(id_), with_deleted)
        type_from_schema = PidStoreBase.get_pid_type_from_schema(record["$schema"])
        if record.pid_type is None or record.pid_type != type_from_schema:
            return cls.get_subclasses()[type_from_schema].get_record(id_, with_deleted)
        return record

    @classmethod
    def get_records_by_pids(cls, pids):
        query = RecordMetadata.query.join(
            PersistentIdentifier, RecordMetadata.id == PersistentIdentifier.object_uuid
        ).filter(
            PersistentIdentifier.object_type == "rec",
            tuple_(PersistentIdentifier.pid_type, PersistentIdentifier.pid_value).in_(
                pids
            ),
        )
        for data in query.yield_per(100):
            yield cls(data.json)

    @classmethod
    def create(cls, data, **kwargs):
        id_ = uuid.uuid4()
        data = cls.strip_empty_values(data)
        with db.session.begin_nested():
            cls.mint(id_, data)
            record = super().create(data, id_=id_, **kwargs)
        return record

    def get_linked_pids_from_field(self, path):
        """Return a list of (pid_type, pid_value) tuples for all records referenced
        in the field at the given path

        Args:
            path (str): the path of the linked records (where $ref is located).
        Returns:
            list: tuples containing (pid_type, pid_value) of the linked records

        Examples:
            >>> data = {
                'references': [
                    {
                        'record': {
                            '$ref': 'http://localhost/literature/1'
                        }
                    }
                ]
            }
            >>>  record = InspireRecord(data=data)
            >>>  records = record.get_linked_pids_from_field("references.record")
            ('lit', 1)
        """
        full_path = ".".join([path, "$ref"])
        pids = [
            PidStoreBase.get_pid_from_record_uri(rec)
            for rec in self.get_value(full_path, [])
        ]
        return pids

    def get_linked_records_from_field(self, path):
        """Return the linked records from specified path.

        Args:
            path (str): the path of the linked records.
        Returns:
            list: the linked records.
        Examples:
            >>> data = {
                'references': [
                    {
                        'record': {
                            '$ref': 'http://localhost/literature/1'
                        }
                    }
                ]
            }
            >>>  record = InspireRecord(data=data)
            >>>  records = record.get_linked_records_from_field("references.record")

        """
        pids = self.get_linked_pids_from_field(path)
        return self.get_records_by_pids(pids)

    def update(self, data):
        with db.session.begin_nested():
            super().update(data)
            self.model.json = self
            db.session.add(self.model)

    def redirect(self, other):
        """Redirect pidstore of current record to the other one.

        Args:
            other (InspireRecord): The record that self is going to be redirected.
        """
        self_pids = PersistentIdentifier.query.filter(
            PersistentIdentifier.object_uuid == self.id
        ).all()
        other_pid = PersistentIdentifier.query.filter(
            PersistentIdentifier.object_uuid == other.id
        ).one()
        with db.session.begin_nested():
            for pid in self_pids:
                pid.redirect(other_pid)
                db.session.add(pid)
            self._mark_deleted()

    @classmethod
    def create_or_update(cls, data, **kwargs):
        control_number = data.get("control_number")
        try:
            record = cls.get_record_by_pid_value(control_number)
            record.update(data)
        except PIDDoesNotExistError:
            record = cls.create(data, **kwargs)
        return record

    def delete(self):
        for file in list(self.files.keys):
            del self.files[file]
        with db.session.begin_nested():
            pids = PersistentIdentifier.query.filter(
                PersistentIdentifier.object_uuid == self.id
            ).all()
            for pid in pids:
                pid.delete()
                db.session.delete(pid)
        self._mark_deleted()

    def _mark_deleted(self):
        self["deleted"] = True

    def hard_delete(self):
        with db.session.begin_nested():
            pids = PersistentIdentifier.query.filter(
                PersistentIdentifier.object_uuid == self.id
            ).all()
            for pid in pids:
                RecordIdentifier.query.filter_by(recid=pid.pid_value).delete()
                db.session.delete(pid)
            db.session.delete(self.model)

    def get_bucket(self, location=None, storage_class=None, record_id=None):
        """Allows to retrieve bucket for any record(default: self)

        Args:
            location (str): Bucket location
                (default: 'RECORDS_DEFAULT_FILE_LOCATION_NAME') from config
            storage_class (str): Bucket storage class
                (default: 'RECORDS_DEFAULT_STORAGE_CLASS') from config
            record_id (int): record to which bucket is asigned
                (default: self)
        Returns:
            Bucket: if found in db for selected location, storage_class and record_id or
                None if there were no bucket.
        Raises:
            NoResultFound: When provided location was not found.

        """
        if not storage_class:
            storage_class = current_app.config["RECORDS_DEFAULT_STORAGE_CLASS"]
        if not location:
            location = current_app.config["RECORDS_DEFAULT_FILE_LOCATION_NAME"]
        if not record_id:
            record_id = self.id
        try:
            logger.debug("Looking for location with name '%s'", location)
            location_obj = Location.get_by_name(location)
        except NoResultFound:
            raise NoResultFound(
                f"Cannot find location '{location}'. "
                f"Please check if system is configured properly!"
            )

        bucket = (
            RecordsBuckets.query.join(Bucket)
            .filter(
                RecordsBuckets.record_id == record_id,
                Bucket.default_storage_class == storage_class,
                Bucket.default_location == location_obj.id,
            )
            .one_or_none()
        )
        if bucket:
            logger.debug("found bucket: '%s'", bucket.bucket.id)
            return bucket.bucket
        logger.info(f"No bucket found for record '{self.id}'")
        return self._create_bucket(location, storage_class)

    def _create_bucket(self, location=None, storage_class=None):
        """Create bucket and return it.

        Note:
            Overwrites base_class._create_bucket method as it is not implemented
            It can create more than one bucket for the same parameters.
            It's private method, do not use it. Instead use `get_bucket()`

        Args:
            location (Location): Bucket location object
                (default: 'RECORDS_DEFAULT_FILE_LOCATION_NAME') from config
            storage_class (str): Bucket storage class
                (default: 'RECORDS_DEFAULT_STORAGE_CLASS') from config

        Returns: Bucket for current record, selected location and storage_class
        """
        logger.info(f"Creating new bucket for {self.__class__.__name__}.'{self.id}'")
        bucket = Bucket.create(location=location, storage_class=storage_class)
        RecordsBuckets.create(record=self.model, bucket=bucket)
        return bucket

    @property
    def files(self):
        """Get files iterator.
        Original one was so ugly that it had to be changed!

        Returns:
            Iterator to files
        """
        if self.model is None:
            raise MissingModelError()

        bucket = self.get_bucket()

        return self.files_iter_cls(self, bucket=bucket, file_cls=self.file_cls)

    def _download_file_from_url(self, url):
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
            >>> self._download_file_from_url('http://example.com/url_to_file.pdf')
            '207611e7bf8a83f0739bb2e16a1a7cf0d585fb5f'
        """
        stream = fsopen(url, mode="rb")
        # TODO: change to stream.read() when fs will be updated to >= 2.0
        # As HTTPOpener is not working with size = -1
        # (and read() method sets this size as default)
        # This is workaround until we will update to fs >2.0
        data = stream._f.wrapped_file.read()
        key = self.hash_data(data=data)
        if key not in self.files.keys:
            file = self._find_local_file(key=key)
            new_key = None
            if file:
                logger.debug("same file found locally, trying to copy")
                try:
                    new_key = self._copy_local_file(file, key)
                except ValueError:
                    pass
                except AttributeError:
                    pass
            if not new_key:
                logger.debug(
                    "Adding file('%s') to %s.(%s) files",
                    key,
                    self.__class__.__name__,
                    self.id,
                )
                self.files[key] = BytesIO(data)
        else:
            logger.debug(
                "file('%s') is already attached to %s.(%s) files",
                key,
                self.__class__.__name__,
                self.id,
            )
        return key

    def _find_local_file(self, key, bucket_id=None):
        """Tries to find proper file

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
            file = ObjectVersion.query.filter(
                ObjectVersion.key == key, ObjectVersion.is_head.is_(True)
            ).first()
        else:
            file = ObjectVersion.get(bucket=bucket_id, key=key)
        return file

    def _verify_file(self, file, file_hash):
        """Verifies if `file` instance is correct for specified `hash`

        Args:
            file (ObjectVersion): File to verify
            file_hash (str): Hash of the file

        Returns:
            str: Returns hash itself it it's matching the file, None otherwise

        """
        calculated_hash = self.hash_data(file_instance=file)
        if calculated_hash == file_hash:
            return file_hash
        return None

    def _copy_local_file(self, file, original_key=None):
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
            key = self._verify_file(file, original_key)
            if not key:
                raise ValueError("File verifiaction failed! Hashes do not match!")
        else:  # Compatibility with old way of holding files
            key = self.hash_data(file_instance=file)
        if key not in self.files.keys:
            logger.debug(
                f"Adding copy of file('{key}') to"
                f" {self.__class__.__name__}.({self.id}) files"
            )
            file.copy(bucket=self.files.bucket.id, key=key)
            self["_files"] = self.files.dumps()
        else:
            logger.debug(
                f"file('{key}') is already attached"
                f" to {self.__class__.__name__}.({self.id}) files"
            )
        return key

    def _download_file_from_local_storage(self, url, **kwargs):
        """Opens local file with ObjectVersion API, callculates it's hash and returns
        hash of the file

        Args:
            url (str): Local url which starts with /api/files/

        Returns:
            str: key(sha-1) of downloaded file
        Examples:
            >>> url = '/api/files/261926f6-4923-458e-adb0/207611e7bf8a83f0739bb2e'
            >>> self._download_file_from_local_storage(url)
                '207611e7bf8a83f0739bb2e'
        """
        url_splited = self.split_url(url)
        try:
            file = self._find_local_file(
                key=url_splited["file"], bucket_id=url_splited["bucket"]
            )
        except ValueError as e:
            logger.info(f"Cannot download file from local storage: {e}")
            file = None

        if not file:
            raise FileNotFoundError(f"{url} is not a valid file in local storage!")
        if self.is_hash(url_splited["file"]):
            file_hash = url_splited["file"]
        else:  # Compatibility with old way of holding files where key was filename
            file_hash = None
        key = self._copy_local_file(file, file_hash)
        return key

    def _find_and_add_file(self, url, original_url=None):
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
                if _url.startswith("/api/files/"):
                    logger.debug(f"'{url}' is local")
                    key = self._download_file_from_local_storage(_url)
            except FileNotFoundError:
                logger.warning(f"Cannot copy from local storage'{url}'!")
                pass
        if not key:
            for _url in urls:
                try:
                    if _url.startswith("http"):
                        logger.debug(f"'{url}' is web based.")
                        key = self._download_file_from_url(_url)
                except ResourceNotFoundError:
                    logger.warning(f"Cannot Download '{url}'!")
                    pass
        return key

    def _add_file(self, url, original_url=None, filename=None, **kwargs):
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
        key = self._find_and_add_file(url, original_url)
        if not key:
            logger.warning(
                f"Downloading failed for url:'{url}'" f" original_url:'{original_url}'."
            )
            raise FileNotFoundError(f"File `{url}|{original_url}` not found")

        if not filename:
            logger.debug(f"'{url}': filename not provided")
            _original_key = kwargs.get("key")
            if _original_key and self.is_filename(_original_key):
                logger.debug("Using original key as filename")
                filename = _original_key
            if not filename and original_url:
                logger.debug(
                    f"procesing original_url:" f"'{original_url}' to resolve filename"
                )
                try:
                    filename = self.split_url(original_url)["file"]
                except ValueError:
                    pass
            if not filename:
                logger.debug(f"procesing url:" f"'{url}' to resolve filename")
                try:
                    filename = self.split_url(url)["file"]
                except ValueError:
                    logger.warning(f"Cannot resolve filename, using key instead")
                    filename = key
        logger.debug(f"Using '{filename}' as filename")

        metadata = kwargs
        metadata["key"] = key

        if not original_url:
            metadata["original_url"] = url
        else:
            metadata["original_url"] = original_url

        metadata["filename"] = filename
        self.files[key]["filename"] = filename
        if "fulltext" not in metadata:
            metadata["fulltext"] = True
        if "hidden" not in metadata:
            metadata["hidden"] = False

        file_path = f"/api/files/{self.files[key].bucket_id}/{key}"

        metadata["url"] = file_path
        return metadata

    def get_serialized_data(self, serializer=None):
        """Prepares serialized record for elasticsearch
        Args:
            serializer(Schema): Schema which should be used to serialize/enhance
        Returns:
            dict: Data serialized/enhanced by serializer.
        Raises:
            MissingSerializerError: If no serializer is set

        """
        if not self.es_serializer and not serializer:
            raise MissingSerializerError(
                f"{self.__class__.__name__} is missing data serializer!"
            )
        if not serializer:
            serializer_module = importlib.import_module(
                self.__module__.replace("api", "marshmallow")
            )
            serializer = getattr(serializer_module, self.es_serializer)
        return serializer().dump(self).data

    def get_ui_data(self, serializer=None):
        """Prepares serialized record for ui
        Returns:
            dict: Enhanced record data
            None: If serializer is not set.
        """
        if not self.ui_serializer and not serializer:
            return None
        if not serializer:
            serializer_module = importlib.import_module(
                self.__module__.replace("api", "marshmallow")
            )
            serializer = getattr(serializer_module, self.ui_serializer)
        return serializer().dump(self).data

    def _index(self, force_delete=None):
        """Runs index in current process.

            This is main logic for indexing. Runs in current thread/worker.
            This method can index not committed record. Use with caution!

        Args:
            force_delete: set to True if record should be deleted from ES

        Returns:
            dict: ES info about indexing

        """
        if self._schema_type != self.pid_type:
            logger.warning(
                f"Record {self.id} is wrapped in {self.__class__.__name__}"
                f"class {self.pid_type} type, but $schema says that this is"
                f"{self._schema_type} type object!"
            )
        if force_delete or self.get("delete", False):
            result = InspireRecordIndexer().delete(self)
        else:
            result = InspireRecordIndexer().index(self)
        logger.info(f"Indexing finished: {result}")
        return result

    def index(self, force_delete=None):
        """Index record in ES

        This method do not have any important logic.
        It just runs self._index() with proper arguments in separate worker.

        To properly index data it requires to fully commit the record first!
        It won't index outdated record.

        Args:
            force_delete: set to True if record has to be deleted,
                If not set, tries to determine automatically if record should be deleted
        Returns:
            celery.result.AsyncResult: Task itself
        """
        indexing_args = self._record_index(self, force_delete=force_delete)
        indexing_args["record_version"] = self.model.version_id
        task = current_celery_app.send_task(
            "inspirehep.records.indexer.tasks.index_record", kwargs=indexing_args
        )
        logger.info(f"Record {self.id} send for indexing")
        return task

    @staticmethod
    def _record_index(record, _id=None, force_delete=None):
        """Helper function for indexer:
            Prepare dictionary for indexer
        Returns:
            dict: proper dict required by the indexer
        """
        if isinstance(record, InspireRecord):
            uuid = record.id
        elif _id:
            uuid = _id
        else:
            raise MissingModelError
        arguments_for_indexer = {
            "uuid": str(uuid),
            "force_delete": force_delete or record.get("deleted", False),
        }
        return arguments_for_indexer

    @property
    def _previous_version(self):
        """Allows to easily acces previous version of the record"""
        data = (
            self.model.versions.filter_by(version_id=self.model.version_id)
            .one()
            .previous.json
        )
        return type(self)(data=data)

    @property
    def _schema_type(self):
        return PidStoreBase.get_pid_type_from_schema(self["$schema"])

    def get_modified_references(self):
        """Return the ids of the references diff between the latest and the
        previous version.

        The diff includes references added or deleted. Changes in a
        reference's content won't be detected.

        Also, it detects if record was deleted/un-deleted compared to the
        previous version and, in such cases, returns the full list of
        references.

        References not linked to any record will be ignored.

        Note: record should be committed to DB in order to correctly get the
        previous version.

        Returns:
            Set[Tuple[str, int]]: pids of references changed from the previous
            version.
        """
        try:
            prev_version = self._previous_version
        except AttributeError:
            prev_version = {}

        changed_deleted_status = self.get("deleted", False) ^ prev_version.get(
            "deleted", False
        )

        if changed_deleted_status:
            return self.get_linked_pids_from_field("references.record")

        ids_latest = set(self.get_linked_pids_from_field("references.record"))
        try:
            ids_oldest = set(
                self._previous_version.get_linked_pids_from_field("references.record")
            )
        except AttributeError:
            return []

        return set.symmetric_difference(ids_latest, ids_oldest)

    def _dump_for_es(self):
        """Prepares proper json data for es serializer

        Returns:
            dict: Properly serialized and prepared record
        """
        serialized_data = self.get_serialized_data()
        return serialized_data

    def dumps_for_es(self):
        """Serializes and dumps record for ElasticSearch purposes

        Returns:
            str: Serialized record and dumped to json
        """
        return json.dumps(self._dump_for_es())

    def get_value(self, field, default=None):
        """Method which makes ``get_value`` more intuitive"""
        return get_value(self, field, default)
