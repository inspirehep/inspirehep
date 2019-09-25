# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import datetime
import json
import uuid

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
            LiteratureRecord.update_authors_signature_blocks_and_uuids(data)
            record = super().create(data, **kwargs)
            if disable_citation_update:
                LOGGER.info(
                    "Record citation update disabled", recid=record["control_number"]
                )
            else:
                record.update_refs_in_citation_table()
            if disable_orcid_push:
                LOGGER.info(
                    "Record ORCID PUSH disabled", recid=record["control_number"]
                )
            else:
                push_to_orcid(record)
            record.push_authors_phonetic_blocks_to_redis()
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

    def set_files(self, documents=None, figures=None, force=False):
        """Sets new documents and figures for record.

        Every figure or document not listed in arguments will be removed from record.
        If you want to only add new documents, use `add_files`

        Args:
            documents (list[dict]): List of documents which should be set to this record
            figures (list[dict]): List of figures which should be set to this record

            Documents and figures are lists of dicts.
            Most obscure dict which should work is:
            {
                'url': 'http:// or /api/file/bucket_id/file_key'
            }

        Returns:
            list: list of keys of all documents and figures in this record

        """
        if not documents and not figures and not force:
            raise TypeError("No files passed, at least one is needed")

        self.pop("figures", None)
        self.pop("documents", None)
        files = []
        if documents or figures:
            files = self.add_files(documents=documents, figures=figures)
        if not current_app.config.get("FEATURE_FLAG_ENABLE_FILES", False):
            return []
        keys = [file_metadata["key"] for file_metadata in files]
        for key in list(self.files.keys):
            if key not in keys:
                del self.files[key]
        return keys

    def add_files(self, documents=None, figures=None):
        """Public method for adding documents and figures

        Args:
            documents (list[dict]): List of documents which should be added to this
            record
            figures (list[dict]): List of figures which should be added to this record

            Documents and figures are lists of dicts.
            Most obscure dict which whould be provided for each file is:
            {
                'url': 'http:// or /api/file/bucket_id/file_key'
                'is_document': True or False(default)
            }


        Returns:
             list: list of added keys
        """
        if not documents and not figures:
            raise TypeError("No files passed, at least one is needed")

        if not current_app.config.get("FEATURE_FLAG_ENABLE_FILES", False):
            if figures:
                self.setdefault("figures", []).extend(figures)

            if documents:
                self.setdefault("documents", []).extend(documents)
            return []
        files = []
        builder = LiteratureBuilder(record=self)
        if documents:
            doc_keys = [
                doc_metadata["key"] for doc_metadata in self.get("documents", [])
            ]
            for doc in documents:
                metadata = self._add_file(document=True, **doc)
                if metadata["key"] not in doc_keys:
                    builder.add_document(**metadata)
                files.append(metadata)
        if figures:
            fig_keys = [fig_metadata["key"] for fig_metadata in self.get("figures", [])]
            for fig in figures:
                metadata = self._add_file(**fig)
                if metadata["key"] not in fig_keys:
                    builder.add_figure(**metadata)
                files.append(metadata)
        # FIXME: this is wrong every time it goes to ``update``` function
        # which means update refs, pidstore etc..
        super().update(builder.record.dumps())
        return files

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
