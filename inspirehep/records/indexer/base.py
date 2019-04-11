# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging

from elasticsearch.helpers import bulk
from flask import current_app
from inspire_schemas.errors import SchemaKeyNotFound, SchemaNotFound
from invenio_indexer.api import RecordIndexer
from invenio_indexer.signals import before_record_index
from invenio_search import current_search_client as es
from jsonschema.exceptions import SchemaError, ValidationError
from sqlalchemy.orm.exc import NoResultFound

logger = logging.getLogger(__name__)


class InspireRecordIndexer(RecordIndexer):
    """Extend Invenio indexer to properly index Inspire records"""

    def _prepare_record(self, record, index, doc_type):
        data = record.dumps_for_es()
        before_record_index.send(
            current_app._get_current_object(),
            json=data,
            record=record,
            index=index,
            doc_type=doc_type,
        )
        return data

    def _process_bulk_record_for_index(
        self, record, version_type="external_gte", index=None, doc_type=None
    ):
        """Process basic data required for indexing record during bulk indexing

        Args:
            record (InspireRecord): Proper inspire record record object
            version_type (str): Proper ES versioning type:
                * internal
                * external
                * external_gt
                * external_gte
            index (str): Name of the index to which record should be indexed.
                Determined automatically from record metadata if not provided.
            doc_type (str): Document type. Determined automatically from
                record metadata if not provided.

        Returns:
            dict: dict with preprocessed record for bulk indexing

        """
        index_from_record, doc_type_from_record = self.record_to_index(record)
        if not doc_type:
            doc_type = doc_type_from_record
        if not index:
            index = index_from_record
        return {
            "_op_type": "index",
            "_index": index,
            "_type": doc_type,
            "_id": str(record.id),
            "_version": record.revision_id,
            "_version_type": version_type,
            "_source": self._prepare_record(record, index, doc_type),
        }

    def bulk_index(self, records_uuids, request_timeout=None):
        """Starts bulk indexing for specified records

        Args:
            records_uuids(list[str): List of strings which are UUID's of records
                to reindex
            request_timeout(int): Maximum time after which   es will throw an exception

        Returns:
            dict: dict with success count and failure list
                (with uuids of failed records)

        """
        if not request_timeout:
            request_timeout = current_app.config["INDEXER_BULK_REQUEST_TIMEOUT"]
        success, failures = bulk(
            es,
            self.bulk_iterator(records_uuids),
            request_timeout=request_timeout,
            raise_on_error=False,
            raise_on_exception=False,
        )

        return {
            "success": success,
            "failures": failures,
            "failures_count": len(records_uuids) - success,
        }

    def bulk_iterator(self, records_uuids):
        for record_uuid in records_uuids:
            data = self.bulk_action(record_uuid)
            if not data:
                continue
            yield data

    def bulk_action(self, record_uuid):
        try:
            from inspirehep.records.api import InspireRecord

            record = InspireRecord.get_record(record_uuid)
            record.validate()
            if record.get("deleted", False):
                return None
            return self._process_bulk_record_for_index(record)
        except NoResultFound:
            logger.error(f"Record {record_uuid} failed to load!")
        except (SchemaNotFound, SchemaKeyNotFound, SchemaError, ValidationError) as e:
            logger.error(f"Record {record_uuid} validation error! {e}")
