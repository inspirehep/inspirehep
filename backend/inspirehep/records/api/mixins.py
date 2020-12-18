# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import geocoder
import structlog
from flask import current_app
from inspire_schemas.utils import country_code_to_name
from inspire_utils.date import fill_missing_date_parts
from inspire_utils.record import get_value, get_values_for_schema
from invenio_db import db
from sqlalchemy import and_, func, not_, or_, text

from inspirehep.records.models import (
    AuthorSchemaType,
    ConferenceLiterature,
    ConferenceToLiteratureRelationshipType,
    ExperimentLiterature,
    InstitutionLiterature,
    RecordCitations,
    RecordsAuthors,
)
from inspirehep.utils import flatten_list

LOGGER = structlog.getLogger()


class PapersAuthorsExtensionMixin:
    def generate_entries_for_authors_in_authors_records_table(self):
        """Generates RecordsAuthors objects table based on record data for authors"""

        authors_ids_field = "authors.ids"
        table_entries_buffer = []
        for author in self.get_value(authors_ids_field, []):
            for id in author:
                try:
                    table_entries_buffer.append(
                        RecordsAuthors(
                            author_id=id["value"],
                            id_type=id["schema"],
                            record_id=self.id,
                        )
                    )
                except KeyError:
                    LOGGER.exception(
                        "id entry is missing keys",
                        recid=self.get("control_number"),
                        uuid=str(self.id),
                    )
        return table_entries_buffer

    def generate_entries_for_collaborations_in_authors_records_table(self):
        """Generates RecordsAuthors objects table based on record data for collaborations"""
        collaborations_field = "collaborations.value"
        table_entries_buffer = []
        for collaboration in self.get_value(collaborations_field, []):
            table_entries_buffer.append(
                RecordsAuthors(
                    author_id=collaboration,
                    id_type=AuthorSchemaType.collaboration.value,
                    record_id=self.id,
                )
            )
        return table_entries_buffer

    def update_authors_records_table(self):
        """Puts all authors ids and collaborations in authors_records table"""
        deleted_count = self.delete_authors_records_table_entries()

        if (
            self.get("deleted", False)
            or self.pid_type not in ["lit"]
            or "Literature" not in self["_collections"]
        ):
            LOGGER.info(
                f"Skipping creating entries in "
                f"{RecordsAuthors.__tablename__} table. Record is not literature or is deleted",
                recid=self.get("control_number"),
                uuid=str(self.id),
            )
            return
        table_entries_buffer = (
            self.generate_entries_for_authors_in_authors_records_table()
        )
        table_entries_buffer.extend(
            self.generate_entries_for_collaborations_in_authors_records_table()
        )

        db.session.bulk_save_objects(table_entries_buffer)
        LOGGER.info(
            "authors_record table updated for record",
            recid=self.get("control_number"),
            uuid=str(self.id),
            added_rows=len(table_entries_buffer),
            deleted_rows=deleted_count,
        )

    def delete_authors_records_table_entries(self):
        """Clean entries for this record"""
        return RecordsAuthors.query.filter_by(record_id=self.id).delete()

    def delete(self):
        self.delete_authors_records_table_entries()
        super().delete()

    def hard_delete(self):
        self.delete_authors_records_table_entries()
        super().hard_delete()

    def update(self, *args, **kwargs):
        super().update(*args, **kwargs)
        self.update_authors_records_table()


class CitationMixin(PapersAuthorsExtensionMixin):
    def _citation_query(self, exclude_self_citations=False):
        """Prepares query with all records which cited this one
        Args:
            exclude_self_citations (bool): excludes all self-citations from query if set to True
        Returns:
            query: Query containing all citations for this record
        """
        query = RecordCitations.query.filter_by(cited_id=self.id)
        if exclude_self_citations and current_app.config.get(
            "FEATURE_FLAG_ENABLE_SELF_CITATIONS"
        ):
            query = query.filter(RecordCitations.is_self_citation.is_(False))
        return query

    @property
    def citation_count(self):
        """Gives citation count number
        Returns:
            int: Citation count number for this record if it is literature or data
            record.
        """
        return self._citation_query().count()

    @property
    def citation_count_without_self_citations(self):
        """Gives citation count number without self-citations
        Returns:
            int: Citation count number for this record if it is literature or data
            record.
        """
        if current_app.config.get("FEATURE_FLAG_ENABLE_SELF_CITATIONS"):
            return self._citation_query(exclude_self_citations=True).count()
        return 0

    def _citations_by_year(self):
        """Return the number of citations received per year for the current record.

        Args:
            exclude_self_citations (bool): excludes self-citations from queries if set to True
        Returns:
            dict: citation summary for this record.
        """
        db_query = self._citation_query()
        db_query = db_query.with_entities(
            func.count(RecordCitations.citation_date).label("sum"),
            func.date_trunc("year", RecordCitations.citation_date).label("year"),
        )
        db_query = db_query.group_by("year").order_by("year")
        return [{"year": r.year.year, "count": r.sum} for r in db_query.all() if r.year]

    @property
    def citations_by_year(self):
        return self._citations_by_year()

    def hard_delete(self):
        with db.session.begin_nested():
            LOGGER.warning("Hard Deleting citations")
            # Removing citations from RecordCitations table and
            # Removing references to this record from RecordCitations table
            RecordCitations.query.filter(
                or_(
                    RecordCitations.citer_id == self.id,
                    RecordCitations.cited_id == self.id,
                )
            ).delete()
        super().hard_delete()

    def is_superseded(self):
        """Checks if record is superseded
        Returns:
            bool: True if is superseded, False otherwise
        """
        return "successor" in self.get_value("related_records.relation", "")

    def update_refs_in_citation_table(self, save_every=100):
        """Updates all references in citation table.
        First removes all references (where citer is this record),
        then adds all from the record again.
        Args:
            save_every (int): How often data should be saved into session.
            One by one is very inefficient, but so is 10000 at once.
        """
        RecordCitations.query.filter_by(citer_id=self.id).delete()
        if (
            self.is_superseded()
            or self.get("deleted")
            or self.pid_type not in ["lit"]
            or "Literature" not in self["_collections"]
        ):
            # Record is not eligible to cite
            LOGGER.info(
                "Record's is not eligible to cite.",
                recid=self.get("control_number"),
                uuid=str(self.id),
            )
            return
        current_record_control_number = str(self.get("control_number"))
        records_pids = self.get_linked_pids_from_field("references.record")
        # Limit records to literature and data as only this types can be cited
        proper_records_pids = []
        allowed_types = ["lit", "dat"]
        for pid_type, pid_value in records_pids:
            if pid_type not in allowed_types:
                continue
            if pid_value == current_record_control_number:
                continue
            proper_records_pids.append((pid_type, pid_value))

        LOGGER.info(
            f"Record has {len(proper_records_pids)} linked references",
            recid=current_record_control_number,
            uuid=str(self.id),
        )
        records_uuids = self.get_records_ids_by_pids(proper_records_pids)
        referenced_records = set()
        references_waiting_for_commit = []
        citation_date = fill_missing_date_parts(self.earliest_date)
        for reference in records_uuids:
            if reference not in referenced_records:
                referenced_records.add(reference)
                references_waiting_for_commit.append(
                    RecordCitations(
                        citer_id=self.model.id,
                        cited_id=reference,
                        citation_date=citation_date,
                        is_self_citation=False,
                    )
                )
            if len(references_waiting_for_commit) >= save_every:
                db.session.bulk_save_objects(references_waiting_for_commit)
                references_waiting_for_commit = []
        if references_waiting_for_commit:
            db.session.bulk_save_objects(references_waiting_for_commit)

        if current_app.config.get("FEATURE_FLAG_ENABLE_SELF_CITATIONS"):
            LOGGER.info("Starting self citations check")
            self.update_self_citations()
        LOGGER.info(
            "Record citations updated",
            recid=current_record_control_number,
            uuid=str(self.id),
        )

    def get_authors_bais(self):
        return get_values_for_schema(
            flatten_list(self.get_value("authors.ids", [])), "INSPIRE BAI"
        )

    def get_collaborations_values(self):
        return self.get_value("collaborations.value", [])

    def get_self_cited_referenced_papers(self):
        uuid = self.model.id
        sql_query = text(
            f"""
            SELECT papers_from_authors.record_id
            FROM
                (SELECT DISTINCT a1.record_id FROM {RecordsAuthors.__tablename__} a1, {RecordsAuthors.__tablename__} a2
                WHERE
                    a2.record_id = :uuid
                    AND a1.author_id=a2.author_id
                    AND (
                        (a1.id_type='INSPIRE BAI' AND a2.id_type='INSPIRE BAI')
                         OR (a1.id_type='collaboration' AND a2.id_type='collaboration')
                    )
                ) AS papers_from_authors,
                (SELECT cited_id as record_id FROM
                  {RecordCitations.__tablename__} WHERE
                citer_id = :uuid
                UNION
                SELECT citer_id AS record_id
                  FROM {RecordCitations.__tablename__}
                WHERE cited_id = :uuid) AS cited_papers
            WHERE
            cited_papers.record_id=papers_from_authors.record_id
        """
        )
        return [
            row.record_id
            for row in db.session.execute(sql_query, {"uuid": uuid}).fetchall()
        ]

    def update_self_citations(self):
        self_citations = self.get_self_cited_referenced_papers()
        LOGGER.info(
            "Self-cited papers",
            self_citations_count=len(self_citations),
            recid=self.get("control_number"),
        )
        uuid = self.model.id
        if self_citations:
            # update self-citations
            RecordCitations.query.filter(
                and_(
                    or_(
                        and_(
                            RecordCitations.cited_id == uuid,
                            RecordCitations.citer_id.in_(self_citations),
                        ),
                        and_(
                            RecordCitations.cited_id.in_(self_citations),
                            RecordCitations.citer_id == uuid,
                        ),
                    ),
                    RecordCitations.is_self_citation.is_(False),
                )
            ).update(
                {RecordCitations.is_self_citation: True}, synchronize_session=False
            )
        # update not-self_citations
        RecordCitations.query.filter(
            and_(
                RecordCitations.cited_id == uuid,
                not_(RecordCitations.citer_id.in_(self_citations)),
                RecordCitations.is_self_citation.is_(True),
            )
        ).update({RecordCitations.is_self_citation: False}, synchronize_session=False)

    def update(self, data, disable_relations_update=False, *args, **kwargs):
        super().update(data, disable_relations_update, *args, **kwargs)

        if disable_relations_update:
            LOGGER.info(
                "Record citation update disabled",
                recid=self.get("control_number"),
                uuid=str(self.id),
            )
        else:
            self.update_refs_in_citation_table()

    def get_all_connected_records_uuids_of_modified_authors(self):
        prev_version = self._previous_version
        current_authors = set(self.get_authors_bais())
        old_authors = set(prev_version.get_authors_bais())
        diff = current_authors.symmetric_difference(old_authors)
        connected_papers = set()
        if diff:
            citers = {
                citer[0]
                for citer in RecordCitations.query.filter_by(cited_id=self.id)
                .with_entities("citer_id")
                .all()
            }
            self_cited = {
                result.record_id
                for result in RecordsAuthors.query.filter(
                    RecordsAuthors.record_id != self.id
                )
                .filter(
                    RecordsAuthors.author_id.in_(diff),
                    RecordsAuthors.id_type == "INSPIRE BAI",
                    RecordsAuthors.record_id.in_(
                        self.get_self_cited_referenced_papers()
                    ),
                )
                .distinct(RecordsAuthors.record_id)
                .all()
            }
            connected_papers = citers | self_cited

        return connected_papers

    def get_all_connected_records_uuids_of_modified_collaborations(self):
        prev_version = self._previous_version
        current_collaborations = set(self.get_collaborations_values())
        old_collaborations = set(prev_version.get_collaborations_values())
        diff = current_collaborations.symmetric_difference(old_collaborations)
        connected_papers = set()
        if diff:
            citers = {
                citer[0]
                for citer in RecordCitations.query.filter_by(cited_id=self.id)
                .with_entities("citer_id")
                .all()
            }
            self_cited = {
                result.record_id
                for result in RecordsAuthors.query.filter(
                    RecordsAuthors.record_id != self.id
                )
                .filter(
                    and_(RecordsAuthors.author_id.in_(diff)),
                    RecordsAuthors.id_type == "collaboration",
                    RecordsAuthors.record_id.in_(
                        self.get_self_cited_referenced_papers()
                    ),
                )
                .distinct(RecordsAuthors.record_id)
                .all()
            }
            connected_papers = citers | self_cited

        return connected_papers


class ConferencePaperAndProceedingsMixin:
    def clean_conference_literature_relation(self):
        ConferenceLiterature.query.filter_by(literature_uuid=self.id).delete()

    def create_conferences_relations(self, document_type):
        conferences_pids = self.get_linked_pids_from_field(
            "publication_info.conference_record"
        )
        conferences = self.get_records_by_pids(conferences_pids)
        conference_literature_relations_waiting_for_commit = []
        for conference in conferences:
            if conference.get("deleted") is not True:
                conference_literature_relations_waiting_for_commit.append(
                    ConferenceLiterature(
                        conference_uuid=conference.id,
                        literature_uuid=self.id,
                        relationship_type=ConferenceToLiteratureRelationshipType(
                            document_type
                        ),
                    )
                )
        if len(conference_literature_relations_waiting_for_commit) > 0:
            db.session.bulk_save_objects(
                conference_literature_relations_waiting_for_commit
            )
            LOGGER.info(
                "Conferecnce-literature relation set",
                recid=self.get("control_number"),
                uuid=str(self.id),
                records_attached=len(
                    conference_literature_relations_waiting_for_commit
                ),
            )

    def update_conference_paper_and_proccedings(self):
        self.clean_conference_literature_relation()
        document_types = set(self.get("document_type"))
        allowed_types = set(
            [option.value for option in list(ConferenceToLiteratureRelationshipType)]
        )
        relationship_types = allowed_types.intersection(document_types)
        if relationship_types and self.get("deleted") is not True:
            self.create_conferences_relations(relationship_types.pop())

    def hard_delete(self):
        self.clean_conference_literature_relation()
        super().hard_delete()

    def update(self, data, disable_relations_update=False, *args, **kwargs):
        super().update(data, disable_relations_update, *args, **kwargs)
        if not disable_relations_update:
            self.update_conference_paper_and_proccedings()
        else:
            LOGGER.info(
                "Record conference papers and proceedings update disabled",
                recid=self.get("control_number"),
                uuid=str(self.id),
            )

    def get_newest_linked_conferences_uuid(self):
        """Returns referenced conferences for which perspective this record has changed"""
        prev_version = self._previous_version

        changed_deleted_status = self.get("deleted", False) ^ prev_version.get(
            "deleted", False
        )
        pids_latest = self.get_linked_pids_from_field(
            "publication_info.conference_record"
        )

        if changed_deleted_status:
            return list(self.get_records_ids_by_pids(pids_latest))

        doc_type_previous = set(prev_version.get("document_type", []))
        doc_type_latest = set(self.get("document_type", []))
        doc_type_diff = doc_type_previous.symmetric_difference(doc_type_latest)
        allowed_types = set(
            [option.value for option in list(ConferenceToLiteratureRelationshipType)]
        )
        type_changed = True if doc_type_diff.intersection(allowed_types) else False

        pids_previous = set(
            self._previous_version.get_linked_pids_from_field(
                "publication_info.conference_record"
            )
        )
        if type_changed:
            pids_changed = set(pids_latest)
            pids_changed.update(pids_previous)
        else:
            pids_changed = set.symmetric_difference(set(pids_latest), pids_previous)

        return list(self.get_records_ids_by_pids(list(pids_changed)))


class InstitutionPapersMixin:
    def clean_institution_literature_relations(self):
        InstitutionLiterature.query.filter_by(literature_uuid=self.id).delete()

    def create_institution_relations(self):
        institutions_pids = self.linked_institutions_pids
        institutions = self.get_records_by_pids(institutions_pids)
        institution_literature_relations_waiting_for_commit = []

        for institution in institutions:
            if institution.get("deleted") is not True:
                institution_literature_relations_waiting_for_commit.append(
                    InstitutionLiterature(
                        institution_uuid=institution.id, literature_uuid=self.id
                    )
                )
        if len(institution_literature_relations_waiting_for_commit) > 0:
            db.session.bulk_save_objects(
                institution_literature_relations_waiting_for_commit
            )
            LOGGER.info(
                "Adding institution-literature relations",
                recid=self.get("control_number"),
                uuid=str(self.id),
                records_attached=len(
                    institution_literature_relations_waiting_for_commit
                ),
            )

    def update_institution_relations(self):
        self.clean_institution_literature_relations()
        if self.get("deleted") is not True:
            self.create_institution_relations()

    def hard_delete(self):
        self.clean_institution_literature_relations()
        super().hard_delete()

    def update(self, data, disable_relations_update=False, *args, **kwargs):
        super().update(data, disable_relations_update, *args, **kwargs)
        if not disable_relations_update:
            self.update_institution_relations()
        else:
            LOGGER.info(
                "Record institution papers update disabled",
                recid=self.get("control_number"),
                uuid=str(self.id),
            )

    def get_modified_institutions_uuids(self):
        prev_version = self._previous_version

        changed_deleted_status = self.get("deleted", False) ^ prev_version.get(
            "deleted", False
        )
        pids_latest = list(self.linked_institutions_pids)

        if changed_deleted_status:
            return list(self.get_records_ids_by_pids(pids_latest))

        pids_previous = self._previous_version.linked_institutions_pids

        pids_changed = set.symmetric_difference(set(pids_latest), set(pids_previous))

        return list(self.get_records_ids_by_pids(list(pids_changed)))


class ExperimentPapersMixin:
    def clean_experiment_literature_relations(self):
        ExperimentLiterature.query.filter_by(literature_uuid=self.id).delete()

    def create_experiment_relations(self):
        experiments_pids = self.linked_experiments_pids
        experiments = self.get_records_by_pids(experiments_pids)
        experiment_literature_relations_waiting_for_commit = []

        for experiment in experiments:
            if experiment.get("deleted") is not True:
                experiment_literature_relations_waiting_for_commit.append(
                    ExperimentLiterature(
                        experiment_uuid=experiment.id, literature_uuid=self.id
                    )
                )
        if len(experiment_literature_relations_waiting_for_commit) > 0:
            db.session.bulk_save_objects(
                experiment_literature_relations_waiting_for_commit
            )
            LOGGER.info(
                "Adding experiment-literature relations",
                recid=self.get("control_number"),
                uuid=str(self.id),
                records_attached=len(
                    experiment_literature_relations_waiting_for_commit
                ),
            )

    def update_experiment_relations(self):
        self.clean_experiment_literature_relations()
        if self.get("deleted") is not True:
            self.create_experiment_relations()

    def hard_delete(self):
        self.clean_experiment_literature_relations()
        super().hard_delete()

    def update(self, data, disable_relations_update=False, *args, **kwargs):
        super().update(data, disable_relations_update, *args, **kwargs)
        if not disable_relations_update:
            self.update_experiment_relations()
        else:
            LOGGER.info(
                "Record experiment papers update disabled",
                recid=self.get("control_number"),
                uuid=str(self.id),
            )

    def get_modified_experiment_uuids(self):
        prev_version = self._previous_version

        changed_deleted_status = self.get("deleted", False) ^ prev_version.get(
            "deleted", False
        )
        pids_latest = list(self.linked_experiments_pids)

        if changed_deleted_status:
            return list(self.get_records_ids_by_pids(pids_latest))

        pids_previous = self._previous_version.linked_experiments_pids

        pids_changed = set.symmetric_difference(set(pids_latest), set(pids_previous))

        return list(self.get_records_ids_by_pids(list(pids_changed)))


class AddressMixin:
    @classmethod
    def create(cls, data, *args, **kwargs):
        data = cls.build_address(data)
        return super().create(data, *args, **kwargs)

    def update(self, data, *args, **kwargs):
        data = self.build_address(data)
        super().update(data, *args, **kwargs)

    @staticmethod
    def get_geolocation(address):
        response = geocoder.osm(address)
        LOGGER.info(f"geocoder.osm response: {response}")
        if response.ok:
            latitude = response.current_result.lat
            longitude = response.current_result.lng

        return latitude, longitude

    @staticmethod
    def country_code_to_name(country_code):
        try:
            return country_code_to_name(country_code)
        except KeyError:
            return None

    @classmethod
    def build_address(cls, data):
        for address in data.get("addresses", []):
            latitude = address.get("latitude")
            longitude = address.get("longitude")
            if latitude and longitude:
                LOGGER.info("Using stored geolocation data.")
                continue
            postal_address = address.get("postal_address", [None])[0]
            if not postal_address:
                place_name = address.get("place_name")
                postal_code = address.get("postal_code")
                city = address.get("cities", [None])[0]
                state = address.get("state")
                country = cls.country_code_to_name(address.get("country_code"))

                address_list = [place_name, postal_code, city, state, country]
                postal_address = ", ".join(
                    [addr_part for addr_part in address_list if addr_part]
                )
            LOGGER.info(f"Querying OSM for address: {postal_address}")
            latitude, longitude = cls.get_geolocation(postal_address)
            if latitude and longitude:
                LOGGER.info("Geolocation data has been found.")
                address["latitude"] = latitude
                address["longitude"] = longitude
        return data
