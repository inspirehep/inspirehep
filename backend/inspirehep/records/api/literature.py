# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import datetime
import json
import uuid
from copy import copy

import requests
import structlog
from flask import current_app
from hepcrawl.parsers import ArxivParser
from hepcrawl.parsers.crossref import CrossrefParser
from idutils import is_doi, normalize_doi
from inspire_json_merger.api import merge
from inspire_schemas.builders import LiteratureBuilder
from inspire_schemas.utils import is_arxiv, normalize_arxiv
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from redis import StrictRedis
from sqlalchemy.orm import aliased

from inspirehep.orcid.api import push_to_orcid
from inspirehep.pidstore.api import PidStoreLiterature
from inspirehep.records.api.mixins import CitationMixin, FilesMixin
from inspirehep.records.errors import (
    ExistingArticleError,
    ImportArticleError,
    ImportConnectionError,
    ImportParsingError,
    UnknownImportIdentifierError,
)
from inspirehep.records.marshmallow.literature import LiteratureElasticSearchSchema
from inspirehep.records.utils import (
    get_authors_phonetic_blocks,
    get_literature_earliest_date,
)
from inspirehep.search.api import LiteratureSearch

from .base import InspireRecord

LOGGER = structlog.getLogger()

PLACEHOLDER = "<ID>"

ARXIV_URL = (
    "http://export.arxiv.org/oai2?"
    "verb=GetRecord&"
    "identifier=oai:arXiv.org:<ID>&"
    "metadataPrefix=arXiv"
)

CROSSREF_URL = "https://api.crossref.org/works/<ID>"


class LiteratureRecord(FilesMixin, CitationMixin, InspireRecord):
    """Literature Record."""

    es_serializer = LiteratureElasticSearchSchema
    pid_type = "lit"
    pidstore_handler = PidStoreLiterature

    @property
    def earliest_date(self):
        return get_literature_earliest_date(self)

    @classmethod
    def create(
        cls, data, disable_orcid_push=False, disable_citation_update=False, **kwargs
    ):
        with db.session.begin_nested():
            record = super().create(data, **kwargs)
            record.update(
                dict(record),
                disable_orcid_push=disable_orcid_push,
                disable_citation_update=disable_citation_update,
            )
            return record

    @classmethod
    def get_es_linked_references(cls, data):
        """Return the generator of linked records from specified path for records in ES.

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
            >>>  records = LiteratureRecord.get_linked_records_from_field(
                data, "references.record")
            >>> list(records)
            [
                {
                    '$schema': 'http://localhost/schemas/records/hep.json'
                    'control_number': 1,
                    'authors': [(...)],
                    'arxiv_eprints':  [(...)],
                    'collaborations': [(...)],
                }
            ]
        """
        pids = cls._get_linked_pids_from_field(data, "record")
        if pids:
            results = LiteratureSearch.get_records_by_pids(pids, source=["_ui_display"])
            for result in results:
                try:
                    rec_data = json.loads(result._ui_display)
                except AttributeError:
                    LOGGER.exception(
                        "Record does not have _ui_display field!", record=result.meta.id
                    )
                    continue
                yield LiteratureRecord(rec_data)
        return []

    def update(
        self, data, disable_orcid_push=False, disable_citation_update=False, **kwargs
    ):
        with db.session.begin_nested():
            LiteratureRecord.update_authors_signature_blocks_and_uuids(data)
            data = self.add_files(data)
            super().update(data)

            if disable_citation_update:
                LOGGER.info(
                    "Record citation update disabled",
                    recid=self.get("control_number"),
                    uuid=str(self.id),
                )
            else:
                self.update_refs_in_citation_table()

            if disable_orcid_push:
                LOGGER.info(
                    "Record ORCID PUSH disabled",
                    recid=self.get("control_number"),
                    uuid=str(self.id),
                )
            else:
                push_to_orcid(self)

            self.push_authors_phonetic_blocks_to_redis()

    def add_files(self, data):
        if not current_app.config.get("FEATURE_FLAG_ENABLE_FILES", False):
            return data

        if "deleted" in data and data["deleted"]:
            return data

        documents = data.pop("documents", [])
        figures = data.pop("figures", [])

        keys = []
        builder = LiteratureBuilder(record=data)

        for document in documents:
            file_data = self.add_file(document=True, **document)
            document.update(file_data)
            if "hidden" not in document:
                document["hidden"] = False
            if "fulltext" not in document:
                document["fulltext"] = True

            builder.add_document(**document)
            keys.append(document["key"])

        if "documents" in builder.record:
            data["documents"] = builder.record["documents"]

        for figure in figures:
            file_data = self.add_file(**figure)
            figure.update(file_data)
            builder.add_figure(**figure)
            keys.append(figure["key"])

        if "figures" in builder.record:
            data["figures"] = builder.record["figures"]

        if self.files:
            for key in list(self.files.keys):
                if key not in keys:
                    del self.files[key]
        if "_files" in self:
            data["_files"] = copy(self["_files"])
        return data

    def get_modified_references(self):
        """Return the ids of the references diff between the latest and the
        previous version.

        The diff includes references added or deleted. Changes in a
        reference's content won't be detected.

        Also, it detects if record was deleted/un-deleted compared to the
        previous version and, in such cases, returns the full list of
        references.

        References not linked to any record will be ignored.

        Note: record should be committed to DB in order to correctly get the
        previous version.

        Returns:
            List: uuids of references changed from the previous
            version.
        """
        try:
            prev_version = self._previous_version
        except AttributeError:
            prev_version = {}

        changed_deleted_status = self.get("deleted", False) ^ prev_version.get(
            "deleted", False
        )

        changed_earliest_date = (
            self.earliest_date != LiteratureRecord(prev_version).earliest_date
        )

        pids_latest = self.get_linked_pids_from_field("references.record")

        if changed_deleted_status or changed_earliest_date:
            return list(self.get_records_ids_by_pids(pids_latest))

        try:
            pids_oldest = set(
                self._previous_version.get_linked_pids_from_field("references.record")
            )
        except AttributeError:
            pids_oldest = []

        pids_changed = set.symmetric_difference(set(pids_latest), pids_oldest)

        return list(self.get_records_ids_by_pids(list(pids_changed)))

    @staticmethod
    def update_authors_signature_blocks_and_uuids(data):
        """Assigns a phonetic block and a uuid to each signature of a record.
        Sends the phonetic blocks to redis to be consumed by the disambiguation service.

        Uses the NYSIIS algorithm to compute a phonetic block from each
        signature's full name, skipping those that are not recognized
        as real names, but logging an error when that happens.
        """

        if "Literature" not in data["_collections"]:
            return

        author_names = get_value(data, "authors.full_name", default=[])

        try:
            signature_blocks = get_authors_phonetic_blocks(author_names)
        except Exception:
            LOGGER.exception(
                "Cannot extract phonetic blocks", recid=data.get("control_number")
            )
            return

        for author in data.get("authors", []):
            author_signature_block = signature_blocks.get(author["full_name"])
            if author_signature_block:
                author["signature_block"] = author_signature_block
            if "uuid" not in author:
                author["uuid"] = str(uuid.uuid4())

    def push_authors_phonetic_blocks_to_redis(self):
        """Sends the phonetic blocks to redis to be consumed by the disambiguation service."""
        if "Literature" not in self["_collections"]:
            return

        redis_url = current_app.config.get("CACHE_REDIS_URL")
        r = StrictRedis.from_url(redis_url)

        for author in self.get("authors", []):
            author_signature_block = author.get("signature_block")
            if author_signature_block:
                r.zadd(
                    "author_phonetic_blocks",
                    {author_signature_block: datetime.datetime.utcnow().timestamp()},
                    nx=True,
                )


def import_article(identifier):
    """Import a new article from arXiv or Crossref based on the identifier.

    This function attempts to parse and normalize the identifier as a valid
    arXiv id or DOI. If the identifier is valid and there is no record in
    Inspire matching the ID, it queries the arXiv/CrossRef APIs and parses
    the record to make it inspire compliant.

    Args:
        identifier(str): the ID of the record to import

    Returns:
        dict: the serialized article

    Raises:
        ExistingArticleError: if the record is already in Inspire.
        ImportArticleError: if no article is found.
        ImportConnectionError: if the importing request fails.
        ImportParsingError: if an error occurs while parsing the result.
        UnknownIdentifierError: if the identifier is neither "arxiv" or "doi".
    """
    if is_arxiv(identifier):
        pid_type = "arxiv"
        pid_value = normalize_arxiv(identifier)

    elif is_doi(identifier):
        pid_type = "doi"
        pid_value = normalize_doi(identifier)

    else:
        raise UnknownImportIdentifierError(identifier)

    ext_pid = aliased(PersistentIdentifier)
    recid_pid = aliased(PersistentIdentifier)

    recid = (
        db.session.query(recid_pid.pid_value)
        .filter(
            recid_pid.object_uuid == ext_pid.object_uuid,
            recid_pid.object_type == ext_pid.object_type,
            ext_pid.object_type == "rec",
            ext_pid.pid_type == pid_type,
            ext_pid.pid_value == pid_value,
            recid_pid.pid_provider == "recid",
        )
        .scalar()
    )

    if recid:
        raise ExistingArticleError(
            f"The article {identifier} already exists in Inspire", recid
        )

    importers = {"arxiv": import_arxiv, "doi": import_doi}
    importer = importers.get(pid_type, UnknownImportIdentifierError)
    article = importer(pid_value)

    if not article:
        raise ImportArticleError(f"No article found for {identifier}")

    if pid_type == "arxiv":
        article = merge_article_with_crossref_data(article)

    return article


def merge_article_with_crossref_data(article):
    doi = get_value(article, "dois[0].value")

    if not doi:
        return article

    try:
        crossref_data = import_doi(doi)
    except (ImportConnectionError, ImportParsingError):
        LOGGER.exception("Cannot merge submission with %r,", doi)
        return article

    merged, conflicts = merge(root={}, head=article, update=crossref_data)
    article = merged
    if conflicts:
        LOGGER.debug("Ignoring conflicts while enhancing submission.\n%r", conflicts)
    return article


def import_arxiv(arxiv_id):
    """View for retrieving an article from arXiv.

    This endpoint is designed to be queried by inspirehep during an article
    submission, to auto-fill the submission form if the user provides an arXiv
    identifier.

    Args:
        arxiv_id: the normalized arXiv id, e.g. `0804.2273`.

    Returns:
        dict: a json object with either the parsed article

    Raises:
        ImportConnectionError: if the request doesn't succeed.
        ImportParsingError: if any error occurs during the response parsing.
    """
    url = ARXIV_URL.replace(PLACEHOLDER, arxiv_id)
    LOGGER.debug("Importing article from arxiv", arxiv=arxiv_id)

    try:
        resp = requests.get(url=url)
    except (ConnectionError, IOError) as exc:
        raise ImportConnectionError("Cannot contact arXiv") from exc

    if resp.status_code >= 400:
        raise ImportConnectionError(f"Cannot contact arXiv. Got response {resp}.")

    if "Malformed identifier" in str(resp.text):
        # arXiv will reply 200 for a non existing arXiv ID with a message error
        return {}

    try:
        parser = ArxivParser(resp.text)
        return parser.parse()
    except Exception as exc:
        raise ImportParsingError(
            f"An error occurred while parsing article oai:arXiv.org:{arxiv_id}."
        ) from exc


def import_doi(doi):
    """View for retrieving an article from CrossRef.

    This endpoint is designed to be queried by inspirehep during an article
    submission, to auto-fill the submission form if the user provides a DOI.

    Args:
        doi: a normalized DOI id, e.g. `10.1088/1361-6633/aa5514`. The
        variable has type `path` in order to properly handle '/' in the param.

    Returns:
        dict: a json object with either the parsed article or the occurred
        error.

    Raises:
        ImportConnectionError: if the request doesn't succeed.
        ImportParsingError: if any error occurs during the response parsing.
    """
    doi = requests.utils.quote(doi, safe="")
    url = CROSSREF_URL.replace(PLACEHOLDER, doi)

    LOGGER.debug("Importing article from CrossRef", doi=doi)
    try:
        resp = requests.get(url=url)
    except (ConnectionError, IOError) as exc:
        raise ImportConnectionError(f"Cannot contact CrossRef.") from exc

    if resp.status_code == 404:
        return {}

    try:
        parser = CrossrefParser(resp.json())
        return parser.parse()

    except Exception as exc:
        raise ImportParsingError("An error occurred while parsing %r", url) from exc
