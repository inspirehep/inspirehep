# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.pidstore.api.conferences import PidStoreConferences
from inspirehep.records.api.base import InspireRecord
from inspirehep.records.models import (
    ConferenceLiterature,
    ConferenceToLiteratureRelationshipType,
)


class ConferencesRecord(InspireRecord):
    """Conferences Record."""

    es_serializer = (
        "inspirehep.records.marshmallow.conferences.ConferencesElasticSearchSchema"
    )
    pid_type = "con"
    pidstore_handler = PidStoreConferences

    def delete_relations_with_literature(self):
        self.linked_papers_query.delete()

    def delete(self):
        super().delete()
        self.delete_relations_with_literature()

    def hard_delete(self):
        self.delete_relations_with_literature()
        super().hard_delete()

    @property
    def linked_papers_query(self):
        return ConferenceLiterature.query.filter_by(conference_uuid=self.id)

    @property
    def number_of_contributions(self):
        return self.linked_papers_query.filter_by(
            relationship_type=ConferenceToLiteratureRelationshipType.conference_paper
        ).count()

    @property
    def proceedings(self):
        proceeding_records = self.linked_papers_query.filter_by(
            relationship_type=ConferenceToLiteratureRelationshipType.proceedings
        ).all()
        proceedings = []
        for record in proceeding_records:
            # assuming there is only one publication_info element in record
            data = record.conference_document.json
            proceedings.append(data)
        return proceedings

    def get_linked_literature_record_uuids_if_conference_title_changed(self):
        if self.get("titles") == self._previous_version.get("titles"):
            return set()

        contributions = self.linked_papers_query.with_entities(
            ConferenceLiterature.literature_uuid
        ).all()
        return {paper[0] for paper in contributions}
