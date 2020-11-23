# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from celery import shared_task
from elasticsearch import TransportError
from flask import current_app
from inspire_matcher.api import match
from inspire_schemas.utils import get_refs_to_schemas
from inspire_utils.record import get_value
from invenio_db import db
from sqlalchemy.exc import OperationalError

from inspirehep.matcher.utils import (
    generate_matcher_config_for_nested_reference_field,
    generate_matcher_config_for_reference_field,
)
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.utils import flatten_list

LOGGER = structlog.getLogger()


def update_records_relations(uuids):
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
                record = InspireRecord.get_record(uuid)
                if isinstance(record, LiteratureRecord):
                    record.update_refs_in_citation_table()
                    record.update_conference_paper_and_proccedings()
                    record.update_institution_relations()
                    record.update_experiment_relations()
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
    queue="indexer_task",
    acks_late=True,
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
    autoretry_for=(OperationalError, TransportError),
)
def redirect_references_to_merged_record(self, uuid):
    record = InspireRecord.get_record(uuid)
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
        config = get_config_for_given_path(index, path)
        matched_records = match({"$ref": merged_record_uri}, config)
        for matched_record in matched_records:
            matched_inspire_record = InspireRecord.get_record(matched_record["_id"])
            referenced_records_in_path = flatten_list(
                get_value(matched_inspire_record, path[: -len(".$ref")], [])
            )
            for referenced_record in referenced_records_in_path:
                update_reference_if_reference_uri_matches(
                    referenced_record, merged_record_uri, new_record_uri
                )
            matched_inspire_record.update(dict(matched_inspire_record))
            LOGGER.info(
                f"Updated reference for record", uuid=str(matched_inspire_record.id)
            )
    db.session.commit()


def get_config_for_given_path(index, path):
    record_with_reference_pid = current_app.config["SCHEMA_TO_PID_TYPES"][index]
    nested_fields = InspireRecord.get_subclasses()[
        record_with_reference_pid
    ].nested_record_fields
    config = (
        generate_matcher_config_for_nested_reference_field(index, path)
        if path.split(".")[0] in nested_fields
        else generate_matcher_config_for_reference_field(index, path)
    )
    return config


def update_reference_if_reference_uri_matches(
    reference_record, merged_record_uri, new_record_uri
):
    if reference_record["$ref"] == merged_record_uri:
        reference_record.update({"$ref": new_record_uri})
