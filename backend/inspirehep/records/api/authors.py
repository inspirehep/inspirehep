# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from flask import current_app
from inspire_utils.record import get_values_for_schema
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.api import RecordMetadata
from sqlalchemy import cast, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.records.api.mixins import StudentsAdvisorMixin
from inspirehep.records.marshmallow.authors import AuthorsElasticSearchSchema
from inspirehep.records.models import RecordsAuthors
from inspirehep.search.api import AuthorsSearch
from inspirehep.utils import chunker

from ...pidstore.api import PidStoreAuthors
from ..utils import get_author_by_bai
from .base import InspireRecord

LOGGER = structlog.getLogger()


class AuthorsRecord(StudentsAdvisorMixin, InspireRecord):
    """Authors Record."""

    es_serializer = AuthorsElasticSearchSchema
    pid_type = "aut"
    pidstore_handler = PidStoreAuthors

    def get_papers_uuids(self):
        all_papers = AuthorsSearch.get_author_papers(self, source="_id")
        papers_ids = {paper.meta["id"] for paper in all_papers}
        return papers_ids

    def get_linked_author_records_uuids_if_author_changed_name(self):
        """Checks if author has changed his name and returns uuids of all his papers if he did

        Checks `name` dictionary to check if name or preferred name changed.

        Args:
            record(AuthorsRecord): Author record for which name could change.

        Returns:
            list(uuid): List of records for author if his name changed
        """
        if self.get("name") == self._previous_version.get("name"):
            return set()
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
        return set()

    @classmethod
    def create(cls, data, id_=None, *args, **kwargs):
        record = super().create(data, id_, **kwargs)
        if current_app.config.get("FEATURE_FLAG_ENABLE_ASSIGN_AUTHOR_PAPERS"):
            record.assign_author_to_papers()
        record.update_students_advisors_table()
        return record

    def assign_author_to_papers(self):
        from .literature import LiteratureRecord

        bai_list = get_values_for_schema(self.get("ids", []), "INSPIRE BAI")
        if not bai_list:
            return
        bai = bai_list[0]
        author_papers_ids = [
            str(record_control_number)
            for record_control_number in self.query_author_papers(bai)
        ]
        author_papers = LiteratureRecord.get_records_batched(author_papers_ids)
        for paper in author_papers:
            author = get_author_by_bai(paper, bai)
            author["record"] = self.get("self")
            paper.update(dict(paper))

    @staticmethod
    def query_author_papers(bai):
        query = RecordsAuthors.query.filter(
            RecordsAuthors.id_type == "INSPIRE BAI",
            RecordsAuthors.author_id == bai,
        )

        for data in query.yield_per(100).with_entities(RecordsAuthors.record_id):
            yield data.record_id

    @classmethod
    def get_stub_authors_by_pids(cls, pids, max_batch=100):
        for batch in chunker(pids, max_chunk_size=max_batch):
            query = cls.get_record_metadata_by_pids(batch).filter(
                type_coerce(RecordMetadata.json, JSONB)["stub"] == cast(True, JSONB)
            )
            for data in query.yield_per(100):
                yield cls(data.json, model=data)

    def update(self, data, *args, **kwargs):
        with db.session.begin_nested():
            super().update(data, *args, **kwargs)
            self.update_students_advisors_table()

    def get_linked_advisors_when_name_changes(self):
        if not self.get("advisors"):
            return set()
        if (
            self.get_value("name.preferred_name")
            != self._previous_version.get_value("name.preferred_name")
        ) or (
            not self.get_value("name.preferred_name")
            and (
                self.get_value("name.value")
                != self._previous_version.get_value("name.value")
            )
        ):
            advisors_references = self.get_value("advisors.record.$ref")
            advisors_pids = [
                PidStoreBase.get_pid_from_record_uri(uri)[1]
                for uri in advisors_references
            ]
            advisor_uuids = (
                PersistentIdentifier.query.with_entities(
                    PersistentIdentifier.object_uuid
                )
                .filter(
                    PersistentIdentifier.pid_type == "aut",
                    PersistentIdentifier.pid_value.in_(advisors_pids),
                )
                .all()
            )
            return set(str(uuid_list[0]) for uuid_list in advisor_uuids)

        return set()

    def hard_delete(self):
        self.delete_students_advisors_table_entries()
        super().hard_delete()
