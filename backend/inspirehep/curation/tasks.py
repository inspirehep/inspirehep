import structlog
from celery import shared_task
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError

from inspirehep.errors import DB_TASK_EXCEPTIONS
from inspirehep.records.api.literature import LiteratureRecord

LOGGER = structlog.getLogger()


def _remove_pdg_keywords_from_record_keywords(record):
    non_pdg_keywords = list(
        filter(lambda keyword: keyword.get("schema") != "PDG", record["keywords"])
    )
    if not non_pdg_keywords:
        del record["keywords"]
    else:
        record["keywords"] = non_pdg_keywords


def _update_record_keywords_with_new_pdg_keywords(record, pdg_keywords):
    keywords = record.get("keywords", [])
    for pdg_keyword in pdg_keywords:
        keywords.append({"schema": "PDG", "value": pdg_keyword})
    if keywords:
        record["keywords"] = keywords


@shared_task(
    ignore_result=False,
    queue="curation",
    acks_late=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=DB_TASK_EXCEPTIONS,
)
def update_pdg_keywords_in_records(ids_to_update, record_ids_pdg_keyword_mapping):
    updated_recids = set()

    for recid in ids_to_update:
        try:
            record = LiteratureRecord.get_record_by_pid_value(recid)
        except PIDDoesNotExistError:
            continue
        if "keywords" in record:
            _remove_pdg_keywords_from_record_keywords(record)
        if str(record["control_number"]) in record_ids_pdg_keyword_mapping:
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
