# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from inspire_utils.record import get_values_for_schema
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from search_check_do import SearchCheckDo
from sqlalchemy.orm import aliased

from inspirehep.records.utils import get_ref_from_pid, remove_author_bai_from_id_list
from inspirehep.search.api import AuthorsSearch
from inspirehep.utils import chunker, flatten_list


class SciPostSetRefereed(SearchCheckDo):
    """Set all SciPost Phys. papers as refereed."""

    query = 'publication_info.journal_title:"scipost phys." and not refereed:true'

    @staticmethod
    def check(record, logger, state):
        journal_titles = record.get_value("publication_info.journal_title", [])
        logger.info("Journal titles in record", journal_titles=journal_titles)
        return any(
            j.lower() == "scipost phys." for j in journal_titles
        ) and not record.get("refereed")

    @staticmethod
    def do(record, logger, state):
        record["refereed"] = True


def advisor_has_inspire_id_but_no_record(advisor):
    has_inspire_id = any(
        id_.get("schema") == "INSPIRE ID" for id_ in advisor.get("ids", [])
    )
    has_no_record = "record" not in advisor
    return has_no_record and has_inspire_id


class LinkAdvisorsWithIDs(SearchCheckDo):
    """Add refs to advisor records based on INSPIRE ID."""

    search_class = AuthorsSearch

    query = 'advisors.ids.schema:"INSPIRE ID"'

    @staticmethod
    def check(record, logger, state):
        return any(
            advisor_has_inspire_id_but_no_record(advisor)
            for advisor in record.get("advisors", [])
        )

    @staticmethod
    def do(record, logger, state):
        for advisor in record["advisors"]:
            if not advisor_has_inspire_id_but_no_record(advisor):
                continue
            inspire_id = get_values_for_schema(advisor["ids"], "INSPIRE ID")[0]
            hits = (
                AuthorsSearch().query_from_iq(f"ids.value:{inspire_id}").execute().hits
            )
            recids = [hit.control_number for hit in hits]
            if len(recids) != 1:
                logger.warning(
                    "No unique match for INSPIRE ID, skipping.",
                    inspire_id=inspire_id,
                    recids=recids,
                )
                continue
            recid = recids[0]
            advisor["record"] = get_ref_from_pid("aut", recid)


class DisambiguateAuthors(SearchCheckDo):
    """Trigger author disambiguation for non-disambiguated records."""

    query = (
        'authors.full_name:* - authors.ids.schema:"INSPIRE BAI" _collections:Literature'
    )

    @staticmethod
    def check(record, logger, state):
        return any(
            not get_values_for_schema(author.get("ids", []), "INSPIRE BAI")
            for author in record.get("authors", [])
        )

    @staticmethod
    def do(record, logger, state):
        for author in record["authors"]:
            bais = get_values_for_schema(author.get("ids", []), "INSPIRE BAI")
            if not bais:
                author.pop("uuid", None)


def _get_bais_for_author_recids_query(recids):
    aut_pid = aliased(PersistentIdentifier)
    bai_pid = aliased(PersistentIdentifier)
    return db.session.query(aut_pid.pid_value, bai_pid.pid_value).filter(
        aut_pid.object_uuid == bai_pid.object_uuid,
        aut_pid.object_type == bai_pid.object_type,
        aut_pid.object_type == "rec",
        aut_pid.pid_type == "aut",
        bai_pid.pid_type == "bai",
        aut_pid.pid_value.in_(recids),
    )


def get_bais_for_author_recids(recids):
    result = {}
    recids_chunked = chunker(recids, 100)
    for chunk in recids_chunked:
        query = _get_bais_for_author_recids_query(chunk)
        result.update({aut: bai for (aut, bai) in query.all()})
    return result


def get_bais_by_recid(record):
    record_bais = {}
    for author in record.get("authors", []):
        bai = (get_values_for_schema(author.get("ids", []), "INSPIRE BAI") or [None])[0]
        recid = get_author_recid(author)
        if bai and recid:
            record_bais[recid] = bai

    return record_bais


def get_author_recid(author):
    return author.get("record", {}).get("$ref", "/").rsplit("/", 1)[-1]


class FixWrongBAIAfterClaim(SearchCheckDo):
    """Fix wrong BAIs in literature records due to bug in claiming, see #2073."""

    query = "du > 2021-06-27"

    @staticmethod
    def check(record, logger, state):
        record_bais = get_bais_by_recid(record)
        correct_bais = get_bais_for_author_recids(record_bais.keys())
        record_bais_lower = {recid: bai.lower() for (recid, bai) in record_bais.items()}
        correct_bais_lower = {
            recid: bai.lower() for (recid, bai) in correct_bais.items()
        }
        corrected_bais = {
            recid: correct_bais[recid]
            for recid in dict(correct_bais_lower.items() - record_bais_lower.items())
        }
        state["corrected_bais"] = corrected_bais
        if corrected_bais:
            incorrect_bais = {recid: record_bais[recid] for recid in corrected_bais}
            logger.info(
                "Correcting BAIs",
                correct_bais=corrected_bais,
                incorrect_bais=incorrect_bais,
            )
            return True
        return False

    @staticmethod
    def do(record, logger, state):
        corrected_bais = state["corrected_bais"]
        for author in record["authors"]:
            recid = get_author_recid(author)
            corrected_bai = corrected_bais.get(recid)
            if not corrected_bai:
                continue
            remove_author_bai_from_id_list(author)
            author["ids"].append({"schema": "INSPIRE BAI", "value": corrected_bai})


LSS_REGEX = re.compile("https?://lss.fnal.gov/cgi-bin/find_paper.pl")


class MoveFermilabURLs(SearchCheckDo):
    query = (
        "urls.value:http://lss.fnal.gov/cgi-bin/find_paper.pl* OR"
        " urls.value:https://lss.fnal.gov/cgi-bin/find_paper.pl*"
    )

    @staticmethod
    def check(record, logger, state):
        return any(LSS_REGEX.match(v) for v in record.get_value("urls.value"))

    @staticmethod
    def do(record, logger, state):
        for url in record["urls"]:
            url["value"] = LSS_REGEX.sub(
                "https://ccd.fnal.gov/cgi-bin/find_paper.pl", url["value"]
            )


class HideElsevierFulltext(SearchCheckDo):
    """Hide fulltexts from Elsevier that have been incorrectly set as non-hidden."""

    query = (
        "(jy 2013 or 2014 or 2015) and documents.filename:'xml' and"
        " (arxiv_eprints.value:* or not documents.hidden:true)"
    )

    @staticmethod
    def check(record, logger, state):
        return any(
            d["filename"].endswith(".xml") and not d.get("hidden")
            for d in record.get("documents", [])
        )

    @staticmethod
    def do(record, logger, state):
        for document in record["documents"]:
            if document["filename"].endswith(".xml") and not document.get("hidden"):
                document["hidden"] = True


class AddINSPIRECategoriesForQuantAndCond(SearchCheckDo):
    """Translate arXiv categories to INSPIRE categories for newly added ``Quantum Physics`` and ``Condensed Matter``."""

    query = "arxiv_eprints.categories:cond-mat* or arxiv_eprints.categories:quant-ph"

    @staticmethod
    def check(record, logger, state):
        state["quant-ph"] = False
        state["cond-mat"] = False
        for cat in flatten_list(record.get_value("arxiv_eprints.categories", [])):
            if cat.startswith("cond-mat"):
                state["cond-mat"] = True
                continue
            if cat == "quant-ph":
                state["quant-ph"] = True
                continue
        for cat in record.get_value("inspire_categories.term", []):
            if cat == "Quantum Physics":
                state["quant-ph"] = False
                continue
            if cat == "Condensed Matter":
                state["cond-mat"] = False
                continue
        if state["quant-ph"] or state["cond-mat"]:
            return True

    @staticmethod
    def do(record, logger, state):
        if state["quant-ph"]:
            record.setdefault("inspire_categories", []).append(
                {"source": "arxiv", "term": "Quantum Physics"}
            )
        if state["cond-mat"]:
            record.setdefault("inspire_categories", []).append(
                {"source": "arxiv", "term": "Condensed Matter"}
            )
