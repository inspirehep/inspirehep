# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

import logging
import uuid
from datetime import datetime

from flask_celeryext.app import current_celery_app
from inspire_dojson.utils import strip_empty_values
from inspire_schemas.api import validate as schema_validate
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier, RecordIdentifier
from invenio_records.errors import MissingModelError
from invenio_records.models import RecordMetadata
from invenio_records_files.api import Record
from sqlalchemy import tuple_
from sqlalchemy.orm.attributes import flag_modified

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.errors import MissingSerializerError, WrongRecordSubclass
from inspirehep.records.indexer.base import InspireRecordIndexer
from inspirehep.records.models import RecordCitations

LOGGER = logging.getLogger(__name__)


class InspireRecord(Record):
    """Inspire Record."""

    pidstore_handler = None
    pid_type = None
    es_serializer = None  # TODO: call es_schema_class

    @staticmethod
    def strip_empty_values(data):
        return strip_empty_values(data)

    def validate(self):
        schema_validate(self)

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
        record_class = cls.get_class_for_record(record)
        if record_class != cls:
            record = record_class(record, model=record.model)
        return record

    @classmethod
    def get_records_by_pids(cls, pids):
        query = cls.get_record_metadata_by_pids(pids)

        for data in query.yield_per(100):
            yield cls(data.json, model=data)

    @classmethod
    def get_records_ids_by_pids(cls, pids, max_batch=100):
        """If query is too big (~5000 pids) SQL refuses to run it,
        so it has to be split"""

        for batch_no in range((len(pids) // max_batch) + 1):
            query = cls._get_records_ids_by_pids(
                pids[max_batch * batch_no : max_batch * (batch_no + 1)]  # noqa
            )
            for data in query.yield_per(100):
                yield data.object_uuid

    @classmethod
    def _get_records_ids_by_pids(cls, pids):
        query = PersistentIdentifier.query.filter(
            PersistentIdentifier.object_type == "rec",
            tuple_(PersistentIdentifier.pid_type, PersistentIdentifier.pid_value).in_(
                pids
            ),
        )
        return query

    @classmethod
    def get_record_metadata_by_pids(cls, pids):
        query = RecordMetadata.query.join(
            PersistentIdentifier, RecordMetadata.id == PersistentIdentifier.object_uuid
        ).filter(
            PersistentIdentifier.object_type == "rec",
            tuple_(PersistentIdentifier.pid_type, PersistentIdentifier.pid_value).in_(
                pids
            ),
        )
        return query

    @classmethod
    def get_class_for_record(cls, data):
        type_from_schema = PidStoreBase.get_pid_type_from_schema(data["$schema"])
        record_class = cls.get_subclasses().get(type_from_schema)
        if record_class is None:
            raise WrongRecordSubclass(
                f"Wrong subclass {cls} used for record of type {type_from_schema}"
            )
        return record_class

    @classmethod
    def create(cls, data, id_=None, **kwargs):
        record_class = cls.get_class_for_record(data)
        if record_class != cls:
            return record_class.create(data, **kwargs)

        data = cls.strip_empty_values(data)

        with db.session.begin_nested():
            if not id_:
                id_ = uuid.uuid4()
                deleted = data.get("deleted", False)
                if not deleted:
                    cls.pidstore_handler.mint(id_, data)
            kwargs.pop("disable_orcid_push", None)
            kwargs.pop("disable_citation_update", None)
            record = super().create(data, id_=id_, **kwargs)
            record.update_model_created_with_legacy_creation_date()
        return record

    @classmethod
    def create_or_update(cls, data, **kwargs):
        control_number = data.get("control_number")
        try:
            # FIXME: This is all over the place should be centralized
            record_class = cls.get_class_for_record(data)
            record = cls.get_record_by_pid_value(
                control_number, pid_type=record_class.pid_type
            )
            record.update(data, **kwargs)
        except PIDDoesNotExistError:
            record = cls.create(data, **kwargs)
        return record

    @classmethod
    def _get_linked_pids_from_field(cls, data, path):
        """Return a list of (pid_type, pid_value) tuples for all records referenced
        in the field at the given path

        Args:
            data (dict): data from which records should be extracted
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
            >>>  record = InspireRecord(data)
            >>>  records = record.get_linked_pids_from_field("references.record")
            ('lit', 1)
        """
        full_path = ".".join([path, "$ref"])
        pids = [
            PidStoreBase.get_pid_from_record_uri(rec)
            for rec in get_value(data, full_path, [])
        ]
        return pids

    @classmethod
    def get_linked_records_from_dict_field(cls, data, path):
        """Return the generator of linked records from specified path.

        Args:
            data (dict): data from which records should be extracted
            path (str): the path of the linked records.
        Yields:
            InspireRecord: the linked records.
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
            >>>  records = InspireRecord.get_linked_records_from_field(
                data, "references.record")
        """
        pids = cls._get_linked_pids_from_field(data, path)
        if pids:
            return cls.get_records_by_pids(pids)
        return []

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
            >>>  record = InspireRecord(data)
            >>>  records = record.get_linked_pids_from_field("references.record")
            ('lit', 1)
        """
        return self._get_linked_pids_from_field(self, path)

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
            >>>  record = InspireRecord(data)
            >>>  records = record.get_linked_records_from_field("references.record")

        """
        return self.get_linked_records_from_dict_field(self, path)

    def commit(self, *args, **kwargs):
        """Stub commit function for compatibility with invenio records API.

        This method does nothing, instead all the work is done in ``update``.
        """

    def update(self, data, **kwargs):
        kwargs.pop("disable_orcid_push", None)
        kwargs.pop("disable_citation_update", None)
        with db.session.begin_nested():
            self.clear()
            super().update(data)
            self.validate()
            self.model.json = dict(self)
            flag_modified(self.model, "json")
            if data.get("deleted"):
                self.pidstore_handler.delete(self.id, self)
            else:
                self.pidstore_handler.update(self.id, self)
            self.update_model_created_with_legacy_creation_date()
            db.session.add(self.model)

    def update_model_created_with_legacy_creation_date(self):
        """Update model with the creation date of legacy.

        Note:
            This should be removed when legacy is out.
        """
        legacy_creation_date = self.get("legacy_creation_date")
        if legacy_creation_date is not None:
            self.model.created = datetime.strptime(legacy_creation_date, "%Y-%m-%d")

    def delete(self):
        with db.session.begin_nested():
            self._mark_deleted()
            self.pidstore_handler.delete(self.id, self)

    def _mark_deleted(self):
        self["deleted"] = True
        self.update(dict(self))

    def hard_delete(self):
        with db.session.begin_nested():
            # Removing citations from RecordCitations table
            RecordCitations.query.filter_by(citer_id=self.id).delete()
            # Removing references to this record from RecordCitations table
            RecordCitations.query.filter_by(cited_id=self.id).delete()

            pids = PersistentIdentifier.query.filter(
                PersistentIdentifier.object_uuid == self.id
            ).all()
            for pid in pids:
                RecordIdentifier.query.filter_by(recid=pid.pid_value).delete()
                db.session.delete(pid)
            db.session.delete(self.model)

    def get_enhanced_es_data(self, serializer=None):
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
            serializer = self.es_serializer

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
            LOGGER.warning(
                "Record %r is wrapped in %r"
                "class %r type, but $schema says that this is"
                "'%r type object!",
                self.id,
                self.__class__.__name__,
                self.pid_type,
                self._schema_type,
            )
        if force_delete or self.get("deleted", False):
            result = InspireRecordIndexer().delete(self)
        else:
            result = InspireRecordIndexer().index(self)
        LOGGER.info("Indexing finished: %r", result)
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
        LOGGER.info("Record %r send for indexing", self.id)
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

    def serialize_for_es(self):
        """Prepares proper json data for es serializer

        Returns:
            dict: Properly serialized and prepared record
        """
        return self.get_enhanced_es_data()

    def get_value(self, field, default=None):
        """Method which makes ``get_value`` more intuitive"""
        return get_value(self, field, default)
