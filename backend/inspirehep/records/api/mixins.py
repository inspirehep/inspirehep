import structlog
from inspire_utils.date import fill_missing_date_parts
from invenio_db import db
from sqlalchemy import func, or_

from inspirehep.records.models import (
    ConferenceLiterature,
    ConferenceToLiteratureRelationshipType,
    InstitutionLiterature,
    RecordCitations,
)

LOGGER = structlog.getLogger()


class CitationMixin:
    def _citation_query(self):
        """Prepares query with all records which cited this one
        Returns:
            query: Query containing all citations for this record
        """
        return RecordCitations.query.filter_by(cited_id=self.id)

    @property
    def citation_count(self):
        """Gives citation count number
        Returns:
            int: Citation count number for this record if it is literature or data
            record.
        """
        return self._citation_query().count()

    @property
    def citations_by_year(self):
        """Return the number of citations received per year for the current record.
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
        for pid_type, pid_value in records_pids:
            if pid_type not in ["lit", "dat"]:
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
                    )
                )
            if len(references_waiting_for_commit) >= save_every:
                db.session.bulk_save_objects(references_waiting_for_commit)
                references_waiting_for_commit = []
        if references_waiting_for_commit:
            db.session.bulk_save_objects(references_waiting_for_commit)
        LOGGER.info(
            "Record citations updated",
            recid=current_record_control_number,
            uuid=str(self.id),
        )

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
        """Returns referenced conferences for which perspective this record has changed
        """
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
        institutions = self.get_linked_records_from_field("authors.affiliations.record")
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
        pids_latest = self.get_linked_pids_from_field("authors.affiliations.record")

        if changed_deleted_status:
            return list(self.get_records_ids_by_pids(pids_latest))

        pids_previous = set(
            self._previous_version.get_linked_pids_from_field(
                "authors.affiliations.record"
            )
        )

        pids_changed = set.symmetric_difference(set(pids_latest), pids_previous)

        return list(self.get_records_ids_by_pids(list(pids_changed)))
