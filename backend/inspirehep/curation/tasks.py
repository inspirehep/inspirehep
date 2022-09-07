import structlog
from celery import shared_task
from invenio_db import db
from sqlalchemy.exc import (
    DisconnectionError,
    OperationalError,
    ResourceClosedError,
    TimeoutError,
    UnboundExecutionError,
)
from sqlalchemy.orm.exc import NoResultFound, StaleDataError

from inspirehep.records.api.literature import LiteratureRecord

LOGGER = structlog.getLogger()


def _remove_pdg_keywords_from_record_keywords(record):
    record_keywords = record["keywords"]
    for keyword_idx, keyword_object in enumerate(record_keywords):
        if keyword_object.get("schema") == "PDG":
            del record_keywords[keyword_idx]
    if not record_keywords:
        del record["keywords"]


def _update_record_keywords_with_new_pdg_keywords(record, pdg_keywords):
    keywords = record.get("keywords", [])
    for pdg_keyword in pdg_keywords:
        keywords.append({"schema": "PDG", "value": pdg_keyword})
    if keywords:
        record["keywords"] = keywords


@shared_task(
    ignore_results=False,
    queue="curation",
    acks_late=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(
        NoResultFound,
        StaleDataError,
        DisconnectionError,
        TimeoutError,
        UnboundExecutionError,
        ResourceClosedError,
        OperationalError,
    ),
)
def update_pdg_keywords_in_records(ids_to_update, record_ids_pdg_keyword_mapping):
    updated_recids = set()

    for recid in ids_to_update:
        record = LiteratureRecord.get_record_by_pid_value(recid)
        _remove_pdg_keywords_from_record_keywords(record)
        if record["control_number"] in record_ids_pdg_keyword_mapping:
            _update_record_keywords_with_new_pdg_keywords(
                record, record_ids_pdg_keyword_mapping[record["control_number"]]
            )
        record.update(dict(record))
        updated_recids.add(record["control_number"])

    new_records_with_pdg_keywords_recids = [
        ("lit", str(recid))
        for recid in set(record_ids_pdg_keyword_mapping).difference(updated_recids)
    ]
    new_records_with_pdg_keywords = LiteratureRecord.get_records_by_pids(
        new_records_with_pdg_keywords_recids
    )

    for record in new_records_with_pdg_keywords:
        if record.get("keywords", []):
            _remove_pdg_keywords_from_record_keywords(record)
        _update_record_keywords_with_new_pdg_keywords(
            record, record_ids_pdg_keyword_mapping[str(record["control_number"])]
        )
        record.update(dict(record))
        updated_recids.add(record["control_number"])

    db.session.commit()
    LOGGER.info(
        "Updated records with PDG keywords",
        number_of_updated_records=len(updated_recids),
        updated_recids=updated_recids,
    )
