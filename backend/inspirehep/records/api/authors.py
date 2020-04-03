# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog

from inspirehep.records.marshmallow.authors import AuthorsElasticSearchSchema
from inspirehep.search.api import AuthorsSearch

from ...pidstore.api import PidStoreAuthors
from .base import InspireRecord

LOGGER = structlog.getLogger()


class AuthorsRecord(InspireRecord):
    """Authors Record."""

    es_serializer = AuthorsElasticSearchSchema
    pid_type = "aut"
    pidstore_handler = PidStoreAuthors

    def get_papers_uuids(self):
        all_papers = AuthorsSearch.get_author_papers(self, source="_id")
        papers_ids = [paper.meta["id"] for paper in all_papers]
        return list(set(papers_ids))

    def get_linked_author_papers_if_author_changed_name(self):
        """Checks if author has changed his name and returns uuids of all his papers if he did

        Checks `name` dictionary to check if name or preferred name changed.

        Args:
            record(AuthorsRecord): Author record for which name could change.

        Returns:
            list(uuid): List of records for author if his name changed
        """
        if self.get("name") == self._previous_version.get("name"):
            return None
        # This is not 100% safe as it might happen that paper will be in the middle
        # of indexing (with author loaded before name changes) but not yet in ES.
        # This might result in paper not re-indexed with proper data.
        # Chances that this will happen are extremely small, but non 0.
        # For now we should try this solution as it's faster and cheaper,
        # but if we will notice records which are not updated,
        # we should consider more complex way.
        # Solution to this would be to create table similar to citations table which would
        # hold relation between papers and authors
        # and it would be source for papers of author.
        uuids = self.get_papers_uuids()
        if uuids:
            LOGGER.info(
                f"Found {len(uuids)} papers assigned to author whose name changed. "
                f"Indexing all of them.",
                uuid=str(self.id),
            )
            return uuids
        return []
