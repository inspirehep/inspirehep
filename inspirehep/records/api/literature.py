# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""
import json
import logging

import requests
from flask import current_app
from hepcrawl.parsers import ArxivParser
from hepcrawl.parsers.crossref import CrossrefParser
from idutils import is_doi, normalize_doi
from inspire_schemas.builders import LiteratureBuilder
from inspire_schemas.utils import is_arxiv, normalize_arxiv
from invenio_pidstore.models import PersistentIdentifier

from inspirehep.pidstore.api import PidStoreLiterature
from inspirehep.records.errors import (
    ExistingArticleError,
    ImportArticleError,
    ImportConnectionError,
    ImportParsingError,
    UnknownImportIdentifierError,
)
from inspirehep.records.marshmallow.literature import LiteratureESEnhancementV1

from .base import InspireRecord

logger = logging.getLogger(__name__)

PLACEHOLDER = "<ID>"

ARXIV_URL = (
    "http://export.arxiv.org/oai2?"
    "verb=GetRecord&"
    "identifier=oai:arXiv.org:<ID>&"
    "metadataPrefix=arXiv"
)

CROSSREF_URL = "https://api.crossref.org/works/<ID>"


class LiteratureRecord(InspireRecord):
    """Literature Record."""

    pid_type = "lit"

    es_serializer = LiteratureESEnhancementV1

    # TODO: remove and do it in es schema
    ui_serializer = "LiteratureMetadataUISchemaV1"

    @classmethod
    def create(cls, data, **kwargs):
        documents = data.pop("documents", None)
        figures = data.pop("figures", None)
        record = super().create(data, **kwargs)
        if documents or figures:
            record.set_files(documents=documents, figures=figures)
        return record

    def update(self, data):
        documents = data.pop("documents", None)
        figures = data.pop("figures", None)
        super().update(data)
        if documents or figures:
            self.set_files(documents=documents, figures=figures)

    @staticmethod
    def mint(record_uuid, data):
        PidStoreLiterature.mint(record_uuid, data)

    def delete(self):
        self.set_files(force=True)
        super().delete()

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
        super().update(builder.record)
        return files

    def _dump_for_es(self):
        serialized_data = super()._dump_for_es()
        serialized_data["_ui_display"] = json.dumps(self.get_ui_data())
        return serialized_data


def import_article(identifier: str) -> dict:
    """Import a new article from arXiv or Crossref based on the identifier.

    This function attempts to parse  and normalize the identifier as a valid
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

    pid = PersistentIdentifier.query.filter_by(
        pid_type=pid_type, pid_value=pid_value
    ).one_or_none()

    if pid:
        raise ExistingArticleError(
            f"Article {identifier} already in Inspire. UUID: {pid.object_uuid}"
        )
    importers = {"arxiv": import_arxiv, "doi": import_doi}
    importer = importers.get(pid_type, UnknownImportIdentifierError)
    article = importer(pid_value)

    if not article:
        raise ImportArticleError(f"No article found for {identifier}")
    return article


def import_arxiv(arxiv_id: str) -> dict:
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

    try:
        resp = requests.get(url=url)
    except (ConnectionError, IOError) as e:
        logger.log(
            level=logging.ERROR, msg=f"Error importing {arxiv_id} at {url}. \n{e}"
        )
        raise ImportConnectionError(f"Cannot contact arXiv: {e}")

    if resp.status_code >= 400:
        raise ImportConnectionError(f"Cannot contact arXiv. Got response {resp}.")

    if "Malformed identifier" in str(resp.text):
        # arXiv will reply 200 for a non existing arXiv ID with a message error
        return {}

    try:
        parser = ArxivParser(resp.text)
        return parser.parse()
    except Exception as e:
        logging.log(level=logging.ERROR, msg=f"Error parsing arXiv {arxiv_id}. \n{e}")
        raise ImportParsingError(
            f"An error occurred while parsing article oai:arXiv.org:{arxiv_id}. Error: {e}."
        )


def import_doi(doi: str) -> dict:
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

    try:
        resp = requests.get(url=url)
    except (ConnectionError, IOError) as e:
        logger.log(level=logging.ERROR, msg=f"Error importing {doi} at {url}. \n{e}")
        raise ImportConnectionError(f"Cannot contact CrossRef: {e}")

    if resp.status_code == 404:
        return {}

    try:
        parser = CrossrefParser(resp.json())
        return parser.parse()

    except Exception as e:
        logging.log(
            level=logging.ERROR, msg=f"Error parsing article with doi {doi}. \n{e}"
        )
        raise ImportParsingError(
            message="An error occurred while parsing {}".format(url), error=str(e)
        )
