# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""
import json
import logging
from inspire_schemas.builders import LiteratureBuilder

from inspirehep.pidstore.api import PidStoreLiterature
from .base import InspireRecord

logger = logging.getLogger(__name__)


class LiteratureRecord(InspireRecord):
    """Literature Record."""

    pid_type = "lit"

    es_serializer = "LiteratureESEnhancementV1"
    ui_serializer = "LiteratureMetadataSchemaV1"

    @classmethod
    def create(cls, data, **kwargs):
        documents = data.pop("documents", None)
        figures = data.pop("figures", None)
        record = super().create(data, **kwargs)
        if documents or figures:
            record.set_files(documents=documents, figures=figures)
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
        self.pop("figures", [])
        self.pop("documents", [])
        files = []
        if documents or figures:
            files = self.add_files(documents=documents, figures=figures)
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
