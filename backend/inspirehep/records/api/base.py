# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

import uuid
from datetime import datetime
from itertools import chain

import structlog
from elasticsearch import NotFoundError
from flask import current_app
from inspire_dojson.utils import strip_empty_values
from inspire_schemas.api import validate as schema_validate
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier, PIDStatus, RecordIdentifier
from invenio_records.api import Record
from invenio_records.errors import MissingModelError
from invenio_records.models import RecordMetadata
from invenio_records.signals import after_record_revert, before_record_revert
from sqlalchemy import tuple_
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.orm.exc import NoResultFound, StaleDataError
from sqlalchemy_continuum import version_class

from inspirehep.indexer.base import InspireRecordIndexer
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.pidstore.models import InspireRedirect
from inspirehep.records.errors import (
    CannotUndeleteRedirectedRecord,
    MissingSerializerError,
    WrongRecordSubclass,
)
from inspirehep.records.utils import get_ref_from_pid
from inspirehep.utils import flatten_list

LOGGER = structlog.getLogger()


class InspireRecord(Record):
    """Inspire Record."""

    pidstore_handler = None
    pid_type = None
    es_serializer = None  # TODO: call es_schema_class

    institution_fields = [
        "authors.affiliations.record",
        "thesis_info.institutions.record",
        "record_affiliations.record",
    ]

    experiment_field = "accelerator_experiments.record"
    nested_record_fields = []

    @staticmethod
    def strip_empty_values(data):
        return strip_empty_values(data)

    def validate(self):
        schema_validate(self)

    @classmethod
    def get_uuid_from_pid_value(cls, pid_value, pid_type=None, original_record=False):
        """Get uuid for provided PID value.

        Args:
            pid_value(str): pid value to query
            pid_type(str): pid_type to query
            original_record(bool): if record was redirected this flag determines whether this method should return
              redirected record uuid (if False) or original record uuid (if True)

        Returns: requested record uuid
        """
        if not pid_type:
            pid_type = cls.pid_type
        pid = PersistentIdentifier.get(pid_type, pid_value)
        if pid.is_redirected() and not original_record:
            pid = InspireRedirect.get_redirect(pid)
        return pid.object_uuid

    @classmethod
    def get_record_by_pid_value(
        cls, pid_value, pid_type=None, original_record=False, with_deleted=True
    ):
        """Get record by provided PID value.

        Args:
            pid_value(str): pid value to query
            pid_type(str): pid_type to query
            original_record(bool): if record was redirected this flag determines whether this method should return
              redirected record (if False) or original record (if True)
            with_deleted(bool): when set to True returns also deleted records

        Returns: requested record
        """
        if not pid_type:
            pid_type = cls.pid_type
        record_uuid = cls.get_uuid_from_pid_value(pid_value, pid_type, original_record)
        with_deleted = original_record or with_deleted
        try:
            return cls.get_record(record_uuid, with_deleted=with_deleted)
        except NoResultFound:
            raise PIDDoesNotExistError(pid_type, pid_value)

    @classmethod
    def get_subclasses(cls):
        records_map = {}
        if cls.pid_type:
            records_map[cls.pid_type] = cls
        for _cls in cls.__subclasses__():
            records_map[_cls.pid_type] = _cls
        return records_map

    @classmethod
    def _get_record_version(cls, record_uuid, record_version):
        RecordMetadataVersion = version_class(RecordMetadata)
        try:
            record = RecordMetadataVersion.query.filter_by(
                id=record_uuid, version_id=record_version
            ).one()
        except NoResultFound:
            LOGGER.warning(
                "Reading stale data",
                uuid=str(record_uuid),
                version=record_version,
            )
            raise StaleDataError()
        record_class = InspireRecord.get_class_for_record(record.json)
        if record_class != cls:
            record = record_class(record.json, model=record)
        return record

    @classmethod
    def _get_record(cls, record_uuid, with_deleted):
        record = super().get_record(str(record_uuid), with_deleted)
        record_class = cls.get_class_for_record(record)
        if record_class != cls:
            record = record_class(record, model=record.model)
        return record

    @classmethod
    def get_record(cls, record_uuid, with_deleted=False, record_version=None):
        """Get record in requested version (default: latest)

        Warning: When record version is not latest one then record.model
            will be `RecordMetadataVersion` not `RecordMetadata`!

        Args:
            record_uuid(str): UUID of the record
            with_deleted(bool): when set to False returns NoResultFound if record was deleted
            record_version: Requested version. If this version is not available then raise StaleDataError

        Returns: Record in requested version.

        """
        if not record_version:
            record = cls._get_record(record_uuid, with_deleted)
        else:
            record = cls._get_record_version(record_uuid, record_version)
        if with_deleted is False and record.get("deleted", False):
            raise NoResultFound
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
    def create(cls, data, id_=None, *args, **kwargs):
        record_class = cls.get_class_for_record(data)
        if record_class != cls:
            return record_class.create(data, *args, **kwargs)
        data = cls.strip_empty_values(data)

        deleted = data.get("deleted", False)

        with db.session.begin_nested():
            if not id_ and not deleted:
                id_ = uuid.uuid4()
                cls.delete_records_from_deleted_records(data)
                cls.pidstore_handler.mint(id_, data)

            if deleted:
                cls.pidstore_handler.delete(id_, data)

            kwargs.pop("disable_external_push", None)
            kwargs.pop("disable_relations_update", None)

            data["self"] = get_ref_from_pid(cls.pid_type, data["control_number"])

            record = cls(data)
            record.validate(**kwargs)

            if not record.get("deleted") and record.get("deleted_records"):
                record.redirect_pids(record["deleted_records"])
            record.model = cls.model_cls(id=id_, json=record)
            record.update_model_created_with_legacy_creation_date()
            db.session.add(record.model)
        return record

    @classmethod
    def create_or_update(cls, data, **kwargs):
        control_number = data.get("control_number")
        try:
            # FIXME: This is all over the place should be centralized
            record_class = cls.get_class_for_record(data)
            record = cls.get_record_by_pid_value(
                control_number, pid_type=record_class.pid_type, original_record=True
            )
            record.update(data, **kwargs)
            LOGGER.info(
                "Record updated", recid=record.control_number, uuid=str(record.id)
            )
        except PIDDoesNotExistError:
            record = cls.create(data, **kwargs)
            LOGGER.info(
                "Record created", recid=record.control_number, uuid=str(record.id)
            )
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
            for rec in flatten_list(get_value(data, full_path, []))
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
        return iter([])

    def copy(self):
        """Copy the record metadata.

        This is needed because the default ``dict.copy`` always returns a ``dict``.
        """
        return type(self)(self)

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

    def redirect_pid(self, pid_type, pid_value):
        try:
            old_pid = PersistentIdentifier.get(pid_type, pid_value)
        except PIDDoesNotExistError:
            LOGGER.warning(
                "Cannot redirect non existent PID",
                pid_to_redirect=pid_value,
                redirecting_pid=self.control_number,
                pid_type=self.pid_type,
            )
            return

        old_pid_object_uuid = str(old_pid.object_uuid)
        new_pid = self.control_number_pid
        InspireRedirect.redirect(old_pid, new_pid)

        old_record = self.get_record(old_pid_object_uuid, with_deleted=True)
        old_record["new_record"] = get_ref_from_pid(self.pid_type, self.control_number)
        if not old_record.get("deleted"):
            old_record.delete()
        else:
            old_record.update(dict(old_record))

    def redirect_pids(self, pids):
        if current_app.config.get("FEATURE_FLAG_ENABLE_REDIRECTION_OF_PIDS"):
            for pid in pids:
                pid_type, pid_value = PidStoreBase.get_pid_from_record_uri(pid["$ref"])
                self.redirect_pid(pid_type, pid_value)
            return pids

    @classmethod
    def delete_records_from_deleted_records(cls, data):
        # Hack for migrator in case new record takes pids from other records
        # which should be deleted but they are not deleted yet.
        for pid in data.get("deleted_records", []):
            pid_type, pid_value = PidStoreBase.get_pid_from_record_uri(pid["$ref"])
            try:
                record_to_delete = cls.get_record_by_pid_value(
                    pid_value, pid_type, original_record=True
                )
            except PIDDoesNotExistError:
                LOGGER.warning(
                    "This pid is missing while still is marked as deleted by another record.",
                    marked_by=data.get("control_number"),
                    marked_to_delete=(pid_type, pid_value),
                )
            else:
                record_to_delete.delete()

    def update(self, data, *args, **kwargs):
        if not self.get("deleted", False):
            if "control_number" not in data:
                raise ValueError("Missing control number in record update.")
            # Currently Invenio is clearing record in put method in invenio_records_rest/views.py
            # this is called just before `record.update()` so here record is already empty
            # it means that it's not possible to verify if control_number is correct in here.
            if data["control_number"] != self.control_number:
                data["self"] = get_ref_from_pid(self.pid_type, data["control_number"])

        pid = PersistentIdentifier.query.filter_by(
            pid_type=self.pid_type, pid_value=str(data["control_number"])
        ).one_or_none()

        if not data.get("deleted") and pid and pid.status == PIDStatus.REDIRECTED:
            # To be sure that when someone edits redirected record by mistake tries to undelete record as this is not supported for now
            raise CannotUndeleteRedirectedRecord(self.pid_type, data["control_number"])

        with db.session.begin_nested():
            with db.session.no_autoflush:
                self.clear()
                super().update(data)
                self.validate()
                self.model.json = dict(self)

                if data.get("deleted"):
                    self.pidstore_handler.delete(self.id, self)
                else:
                    self.delete_records_from_deleted_records(data)
                    self.pidstore_handler.update(self.id, self)
                    if self.get("deleted_records"):
                        self.redirect_pids(self["deleted_records"])
                self.update_model_created_with_legacy_creation_date()
                flag_modified(self.model, "json")
                db.session.merge(self.model)

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
        LOGGER.info("Record deleted", recid=self.control_number, uuid=str(self.id))

    def _mark_deleted(self):
        self["deleted"] = True
        self.update(dict(self))

    def hard_delete(self):
        recid = self.control_number
        with db.session.begin_nested():
            pids = PersistentIdentifier.query.filter(
                PersistentIdentifier.object_uuid == self.id,
                PersistentIdentifier.object_type == "rec",
                PersistentIdentifier.status != PIDStatus.REDIRECTED,
            ).all()
            for pid in pids:
                if pid.pid_provider == "recid":
                    RecordIdentifier.query.filter_by(recid=pid.pid_value).delete()
                db.session.delete(pid)
            db.session.delete(self.model)

            try:
                InspireRecordIndexer().delete(self)
            except NotFoundError:
                LOGGER.info("Record not found in ES", recid=recid, uuid=self.id)

        LOGGER.info("Record hard deleted", recid=recid)

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

    def index(self, force_delete=None, delay=True):
        """Index record in ES.

        Args:
            force_delete: set to True if record has to be deleted,
                If not set, tries to determine automatically if record should be deleted
            delay: if True will start the index task async otherwise async.
        """
        from inspirehep.indexer.tasks import index_record

        arguments = {
            "uuid": str(self.id),
            "record_version": self.model.version_id,
            "force_delete": force_delete,
        }
        LOGGER.info(
            "Record indexing",
            recid=self.control_number,
            uuid=str(self.id),
            arguments=arguments,
        )
        if delay:
            index_record.delay(**arguments)
            return
        index_record(**arguments)

    @property
    def _previous_version(self):
        """Returns the previous version of the record"""
        data = {}
        RecordMetadataVersion = version_class(RecordMetadata)
        try:
            if isinstance(self.model, RecordMetadataVersion):
                current = self.model
            else:
                current = self.model.versions.filter_by(
                    version_id=self.model.version_id
                ).one()
            if current.previous:
                data = current.previous.json
        except NoResultFound:
            LOGGER.warning(
                "Record previous version is not found",
                version_id=self.model.version_id,
                uuid=self.id,
            )

        return type(self)(data=data)

    @property
    def _schema_type(self):
        return PidStoreBase.get_pid_type_from_schema(self["$schema"])

    @property
    def linked_institutions_pids(self):
        return set(
            chain.from_iterable(
                self.get_linked_pids_from_field(field)
                for field in self.institution_fields
            )
        )

    @property
    def linked_experiments_pids(self):
        return self.get_linked_pids_from_field(self.experiment_field)

    def serialize_for_es(self):
        """Prepares proper json data for es serializer

        Returns:
            dict: Properly serialized and prepared record
        """
        return self.get_enhanced_es_data()

    def get_value(self, field, default=None):
        """Method which makes ``get_value`` more intuitive"""
        return get_value(self, field, default)

    def revert(self, revision_id):
        if self.model is None:
            raise MissingModelError()

        revision = self.revisions[revision_id]

        with db.session.begin_nested():
            before_record_revert.send(current_app._get_current_object(), record=self)

            self.update(dict(revision))

        after_record_revert.send(current_app._get_current_object(), record=self)
        return self

    @property
    def control_number(self):
        return self.get("control_number")

    @property
    def control_number_pid(self):
        return PersistentIdentifier.get(self.pid_type, self.control_number)

    @property
    def redirected_record_ref(self):
        """Returns redirected PID if PID was redirected, otherwise returns None"""
        pid = self.control_number_pid
        if self.get("deleted") and pid.status == PIDStatus.REDIRECTED:
            redirection = InspireRedirect.get_redirect(pid)
            return get_ref_from_pid(redirection.pid_type, redirection.pid_value)
