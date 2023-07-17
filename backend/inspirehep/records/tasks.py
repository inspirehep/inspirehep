# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from celery import shared_task
from dict_deep import deep_set
from flask import current_app
from inspire_schemas.utils import get_refs_to_schemas
from inspire_utils.dedupers import dedupe_list_of_dicts
from inspire_utils.helpers import maybe_int
from inspire_utils.record import get_value
from invenio_db import db
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError
from opensearch_dsl import Q
from sqlalchemy.exc import OperationalError

from inspirehep.errors import DB_TASK_EXCEPTIONS, ES_TASK_EXCEPTIONS
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.search.api import InspireSearch
from inspirehep.utils import flatten_list

LOGGER = structlog.getLogger()


@shared_task(
    bind=True,
    retry_backoff=True,
    acks_late=True,
    retry_kwargs={"max_retries": 6},
    autoretry_for=DB_TASK_EXCEPTIONS,
)
def update_records_relations(self, uuids):
    """Task which updates records_citations, institution_literature, experiment_literature and conference_literature tables with
    relation to proper literature records.

    Args:
        uuids: records uuids for which relations should be reprocessed
    Returns:
        set: set of properly processed records uuids
    """
    for uuid in uuids:
        try:
            with db.session.begin_nested():
                record = InspireRecord.get_record(uuid, with_deleted=True)
                if isinstance(record, LiteratureRecord):
                    record.update_refs_in_citation_table()
                    record.update_conference_paper_and_proccedings()
                    record.update_institution_relations()
                    record.update_experiment_relations()
                    record.update_journal_relations()
        except OperationalError:
            LOGGER.exception(
                "OperationalError on recalculate relations.", uuid=str(uuid)
            )
            raise
        except Exception:
            LOGGER.exception("Cannot recalculate relations", uuid=str(uuid))

    db.session.commit()
    return uuids


@shared_task(
    bind=True,
    queue="redirect_references",
    retry_backoff=True,
    acks_late=True,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(*DB_TASK_EXCEPTIONS, *ES_TASK_EXCEPTIONS),
)
def redirect_references_to_merged_record(self, uuid):
    record = InspireRecord.get_record(uuid, with_deleted=True)
    new_record_ref = record["new_record"]["$ref"]
    deleted_record_ref = record["self"]["$ref"]
    record_schema = PidStoreBase.get_schema_name_from_uri(record["$schema"])
    possible_refs_to_record = get_refs_to_schemas()[record_schema]
    update_references_pointing_to_merged_record(
        possible_refs_to_record, deleted_record_ref, new_record_ref
    )


def update_references_pointing_to_merged_record(
    refs_to_schema, merged_record_uri, new_record_uri
):
    for index, path in refs_to_schema:
        query = get_query_for_given_path(index, path, merged_record_uri)
        es_index_name = f"records-{index}"
        matched_records = (
            InspireSearch(index=es_index_name).query(query).params(scroll="60m").scan()
        )
        for matched_record in matched_records:
            should_matched_record_be_updated = False
            pid_type = current_app.config["SCHEMA_TO_PID_TYPES"][index]
            record_class = InspireRecord.get_subclasses()[pid_type]
            matched_inspire_record_data = (
                db.session.query(RecordMetadata)
                .filter_by(id=matched_record.meta.id)
                .first()
            )
            matched_inspire_record = record_class(
                matched_inspire_record_data.json, model=matched_inspire_record_data
            )
            referenced_records_in_path = flatten_list(
                get_value(matched_inspire_record, path[: -len(".$ref")], [])
            )

            for referenced_record in referenced_records_in_path:
                if referenced_record["$ref"] == merged_record_uri:
                    referenced_record.update({"$ref": new_record_uri})
                    should_matched_record_be_updated = True
            if should_matched_record_be_updated:
                remove_duplicate_refs_from_record(matched_inspire_record, path)
                matched_inspire_record.update(dict(matched_inspire_record))
                LOGGER.info(
                    "Updated reference for record", uuid=str(matched_inspire_record.id)
                )
                db.session.commit()


def get_query_for_given_path(index, path, record_ref):
    record_with_reference_pid = current_app.config["SCHEMA_TO_PID_TYPES"][index]
    nested_fields = InspireRecord.get_subclasses()[
        record_with_reference_pid
    ].nested_record_fields
    record_recid = maybe_int(record_ref.split("/")[-1])
    if path.split(".")[0] in nested_fields:
        query = Q(
            "nested", path=path.split(".")[0], query=Q("match", **{path: record_recid})
        )
    else:
        query = Q("match", **{path: record_recid})
    return query


@shared_task
def regenerate_author_records_table_entries(uuids_to_regenerate):
    records = LiteratureRecord.get_records(uuids_to_regenerate)
    for record in records:
        record.update_authors_records_table()
        record.update_self_citations()
        db.session.commit()


def remove_duplicate_refs_from_record(matched_inspire_record, path):
    references_path = ".".join(path.split(".")[:-2])
    references = flatten_list(get_value(matched_inspire_record, references_path, []))

    deduped_references = dedupe_list_of_dicts(references)
    if len(references) == len(deduped_references):
        return None

    deep_set(matched_inspire_record, references_path, deduped_references)
    return matched_inspire_record


@shared_task(
    ignore_results=False,
    acks_late=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=DB_TASK_EXCEPTIONS,
)
def populate_journal_literature(uuids):
    records = LiteratureRecord.get_records(uuids)
    for record in records:
        record.update_journal_relations()
        db.session.commit()


@shared_task(
    ignore_results=False,
    acks_late=True,
    retry_backoff=True,
    retry_kwargs={"max_retries": 8},
    autoretry_for=DB_TASK_EXCEPTIONS,
)
def remove_bai_from_literature_authors(uuids):
    records = LiteratureRecord.get_records(uuids)
    for record in records:
        for author in record.get("authors"):
            author_ids = author.get("ids")
            if not author_ids:
                continue
            new_ids = [
                id_dict for id_dict in author_ids if id_dict["schema"] != "INSPIRE BAI"
            ]
            if new_ids:
                author["ids"] = new_ids
            else:
                del author["ids"]
        try:
            record.update(dict(record), disable_disambiguation=True)
            db.session.commit()
        except ValidationError:
            LOGGER.warning(
                "Can't update record due to validation error",
                recid=record["control_number"],
                uuid=record.id,
            )
