#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app
from inspire_utils.record import get_value
from invenio_indexer.api import RecordIndexer
from invenio_indexer.signals import before_record_index
from invenio_search import current_search_client as es
from invenio_search.engine import search
from kombu.exceptions import EncodeError
from opensearchpy import ConflictError, NotFoundError, RequestError, TransportError
from opensearchpy.helpers import streaming_bulk
from sqlalchemy.orm.exc import NoResultFound

LOGGER = structlog.getLogger()


class InspireRecordIndexer(RecordIndexer):
    """Extend Invenio indexer to properly index Inspire records"""

    def __init__(self, skip_indexing_references=False, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._skip_indexing_references = skip_indexing_references

    @staticmethod
    def _prepare_record(record, index, doc_type="_doc", arguments=None, **kwargs):
        from inspirehep.records.api.literature import LiteratureRecord

        data = (
            record.serialize_for_es_with_fulltext()
            if current_app.config["FEATURE_FLAG_ENABLE_FULLTEXT"]
            and isinstance(record, LiteratureRecord)
            else record.serialize_for_es()
        )
        before_record_index.send(
            current_app._get_current_object(),
            json=data,
            record=record,
            index=index,
            arguments={} if arguments is None else arguments,
            **kwargs,
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
        from inspirehep.records.api.literature import LiteratureRecord

        index_from_record = self.record_to_index(record)
        if not index:
            index = index_from_record

        index = self._prepare_index(index)
        payload = {
            "_op_type": "index",
            "_index": index,
            "_type": doc_type,
            "_id": str(record.id),
            "_version": record.revision_id,
            "_version_type": version_type,
            "_source": self._prepare_record(record, index, doc_type),
        }
        if current_app.config["FEATURE_FLAG_ENABLE_FULLTEXT"] and isinstance(
            record, LiteratureRecord
        ):
            ingestion_pipeline_name = current_app.config["ES_FULLTEXT_PIPELINE_NAME"]
            payload["pipeline"] = ingestion_pipeline_name
        return payload

    def bulk_index(self, records_uuids, request_timeout=None, max_chunk_bytes=None):
        """Starts bulk indexing for specified records

        Args:
            records_uuids(list[str): List of strings which are UUID's of records
                to reindex
            request_timeout(int): Maximum time after which es will throw an exception

        Returns:
            dict: dict with success count and failure list
                (with uuids of failed records)

        """
        LOGGER.info("Bulk index started.", uuids=records_uuids)
        if not request_timeout:
            request_timeout = current_app.config["INDEXER_BULK_REQUEST_TIMEOUT"]
        max_chunk_bytes = max_chunk_bytes or 100 * 1014 * 1024  # default ES setting
        result = streaming_bulk(
            es,
            self.bulk_iterator(records_uuids),
            request_timeout=request_timeout,
            raise_on_error=False,
            raise_on_exception=False,
            expand_action_callback=search.helpers.expand_action,
            max_retries=5,  # Retires on Error 429
            initial_backoff=10,  # wait for initial_backoff * 2^retry_number,
            max_chunk_bytes=max_chunk_bytes,
        )
        failures = []
        for action_success, action_data in result:
            if not action_success:
                failures.append(
                    {
                        "status_code": action_data["index"]["status"],
                        "error_type": str(
                            get_value(action_data, "index.error.type", "")
                        ),
                        "falure_reason": str(
                            get_value(action_data, "index.error.reason", "")
                        ),
                    }
                )

        number_of_failures = len(failures)

        result_payload = {
            "uuids": records_uuids,
            "success_count": len(records_uuids) - number_of_failures,
            "failures_count": number_of_failures,
            "failures": failures,
        }
        LOGGER.info("Bulk index is finished.", results=result_payload)
        return result_payload

    def bulk_iterator(self, records_uuids):
        for record_uuid in records_uuids:
            data = self.bulk_action(record_uuid)
            if not data:
                continue
            yield data

    def bulk_action(self, record_uuid):
        try:
            from inspirehep.records.api import InspireRecord

            record = InspireRecord.get_record(record_uuid, with_deleted=True)
            if record.get("deleted", False):
                try:
                    # When record is not in es then dsl is throwing TransportError(404)
                    record.index(
                        delay=False,
                        force_delete=True,
                        skip_indexing_references=self._skip_indexing_references,
                    )
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

    def _get_indexing_arguments(self, fulltext=False):
        """Returns custom arguments for record indexing"""
        if fulltext:
            arguments = {
                "pipeline": current_app.config["ES_FULLTEXT_PIPELINE_NAME"],
                # TODO: when opensearch 2.2.1 is released, update package & change arg name to `timeout`
                "request_timeout": int(
                    current_app.config["FULLLTEXT_INDEXER_REQUEST_TIMEOUT"]
                ),
            }
            return arguments

    def index(self, record, force_delete=None, record_version=None):
        from inspirehep.records.api.literature import LiteratureRecord

        if not force_delete:
            deleted = record.get("deleted", False)

        if force_delete or deleted:
            try:
                self.delete(record)
                LOGGER.debug("Record removed from ES", uuid=str(record.id))
            except NotFoundError:
                LOGGER.debug("Record to delete not found", uuid=str(record.id))
        else:
            try:
                fulltext_enabled = current_app.config[
                    "FEATURE_FLAG_ENABLE_FULLTEXT"
                ] and isinstance(record, LiteratureRecord)
                super().index(
                    record, arguments=self._get_indexing_arguments(fulltext_enabled)
                )
            except ConflictError as err:
                LOGGER.warning(
                    "VersionConflict on record indexing.",
                    uuid=str(record.id),
                    record_version=record_version,
                    force_delete=force_delete,
                    error=err,
                )
