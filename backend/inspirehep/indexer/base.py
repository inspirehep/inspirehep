# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from elasticsearch import RequestError, TransportError
from elasticsearch.helpers import bulk
from flask import current_app
from invenio_indexer.api import RecordIndexer
from invenio_indexer.signals import before_record_index
from invenio_indexer.utils import _es7_expand_action
from invenio_search import current_search_client as es
from kombu.exceptions import EncodeError
from sqlalchemy.orm.exc import NoResultFound

LOGGER = structlog.getLogger()


class InspireRecordIndexer(RecordIndexer):
    """Extend Invenio indexer to properly index Inspire records"""

    @staticmethod
    def _prepare_record(record, index, doc_type="_doc", arguments=None, **kwargs):
        data = record.serialize_for_es()
        before_record_index.send(
            current_app._get_current_object(),
            json=data,
            record=record,
            index=index,
            doc_type=doc_type,
            arguments={} if arguments is None else arguments,
            **kwargs
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
        if not index:
            index = index_from_record

        index, doc_type = self._prepare_index(index, doc_type or doc_type_from_record)
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
            expand_action_callback=(_es7_expand_action),
            max_retries=5,  # Retires on Error 429
            initial_backoff=10,  # wait for initial_backoff * 2^retry_number
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
            if record.get("deleted", False):
                try:
                    # When record is not in es then dsl is throwing TransportError(404)
                    record.index(delay=False, force_delete=True)
                except TransportError:
                    LOGGER.warning("Record not found in ES!", uuid=str(record.id))
                return None
            return self._process_bulk_record_for_index(record)
        except NoResultFound:
            LOGGER.exception("Record failed to load", uuid=str(record_uuid))
        except RequestError:
            LOGGER.exception("Cannot process request on ES", uuid=str(record_uuid))
        except EncodeError:
            LOGGER.exception(
                "Kombu is not able to process response!", uuid=str(record_uuid)
            )
