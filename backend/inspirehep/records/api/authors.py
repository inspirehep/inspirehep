# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from inspire_utils.record import get_values_for_schema

from inspirehep.records.marshmallow.authors import AuthorsElasticSearchSchema
from inspirehep.records.models import RecordsAuthors

from ...pidstore.api import PidStoreAuthors
from .base import InspireRecord

LOGGER = structlog.getLogger()


class AuthorsRecord(InspireRecord):
    """Authors Record."""

    es_serializer = AuthorsElasticSearchSchema
    pid_type = "aut"
    pidstore_handler = PidStoreAuthors

    def get_papers_uuids(self):
        uuids = RecordsAuthors.query.filter_by(author_id=self.bai).with_entities(
            "record_id"
        )
        papers_uuids = {uuid[0] for uuid in uuids}
        return papers_uuids

    def get_linked_author_records_uuids_if_author_changed_name(self):
        """Checks if author has changed his name and returns uuids of all his papers if he did

        Checks `name` dictionary to check if name or preferred name changed.

        Args:
            record(AuthorsRecord): Author record for which name could change.

        Returns:
            list(uuid): List of records for author if his name changed
        """

        if self.get("name") == self._last_indexed.get("name"):
            return set()
        uuids = self.get_papers_uuids()
        if uuids:
            LOGGER.info(
                f"Found {len(uuids)} papers assigned to author whose name changed. "
                f"Indexing all of them.",
                uuid=str(self.id),
            )
            return uuids
        return set()

    @property
    def bai(self):
        ids_for_schema = get_values_for_schema(self.get("ids", []), "INSPIRE BAI")
        return ids_for_schema[0] if ids_for_schema else None
