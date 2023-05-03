# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError

from inspirehep.records.api import JournalsRecord

LOGGER = structlog.getLogger()


def get_journal_records_from_publication_info(record):
    journal_records_refs = get_value(record, "publication_info.journal_record")
    journal_records = []
    for ref in journal_records_refs:
        recid = get_recid_from_ref(ref)
        try:
            journal_records.append(JournalsRecord.get_record_by_pid_value(recid))
        except PIDDoesNotExistError:
            LOGGER.warning(
                "Journal referenced in literature record not found",
                literature_recid=record["control_number"],
                journal_recid=recid,
            )
    return journal_records


def set_refereed_and_fix_document_type(record):
    """Set the ``refereed`` field using the Journals DB.

    Searches in the Journals DB if the current article was published in journals
    that we know for sure to be peer-reviewed, or that publish both peer-reviewed
    and non peer-reviewed content but for which we can infer that it belongs to
    the former category, and sets the ``refereed`` key in ``data`` to ``True`` if
    that was the case. If instead we know for sure that all journals in which it
    published are **not** peer-reviewed we set it to ``False``.

    Also replaces the ``article`` document type with ``conference paper`` if the
    paper was only published in non refereed proceedings.

    Args:
        obj: a workflow object.
        eng: a workflow engine.

    Returns:
        None

    """
    journals = get_journal_records_from_publication_info(record)
    if not journals:
        LOGGER.info(
            "Journals not found for record", record_recid=record["control_number"]
        )
        return

    published_in_a_refereed_journal_without_proceedings = any(
        journal.get("refereed") and not journal.get("proceedings")
        for journal in journals
    )
    published_in_a_refereed_journal_with_proceedings = any(
        journal.get("refereed") and journal.get("proceedings") for journal in journals
    )
    not_a_conference_paper = "conference paper" not in record["document_type"]
    published_exclusively_in_non_refereed_journals = all(
        not journal.get("refereed", True) for journal in journals
    )

    published_only_in_proceedings = all(
        journal.get("proceedings") for journal in journals
    )
    published_only_in_non_refereed_journals = all(
        not journal.get("refereed") for journal in journals
    )

    if published_in_a_refereed_journal_without_proceedings or (
        not_a_conference_paper and published_in_a_refereed_journal_with_proceedings
    ):
        record["refereed"] = True
    elif published_exclusively_in_non_refereed_journals:
        record["refereed"] = False

    if published_only_in_proceedings and published_only_in_non_refereed_journals:
        try:
            record["document_type"].remove("article")
            record["document_type"].append("conference paper")
        except ValueError:
            LOGGER.warning(
                "Document type can not be updated",
                record_recid=record["control_number"],
            )
            pass
    record.update(dict(record))
    db.session.commit()
