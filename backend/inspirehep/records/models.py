# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Additional models used by InspireRecords."""
import enum
from datetime import datetime

from invenio_db import db
from invenio_records.models import RecordMetadata
from sqlalchemy import Boolean, Date, Enum, Text
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from sqlalchemy_utils import UUIDType


class RecordCitations(db.Model):
    """Adds Citation table which holds all references
    which are also eligible citations"""

    __tablename__ = "records_citations"

    __table_args__ = (
        db.Index("ix_records_citations_cited_id_citer_id", "cited_id", "citer_id"),
        db.Index(
            "ix_records_citations_cited_id_citation_type",
            "cited_id",
            "is_self_citation",
        ),
        db.Index(
            "ix_records_citations_citer_id_citation_type",
            "citer_id",
            "is_self_citation",
        ),
    )

    citer_id = db.Column(
        UUIDType,
        db.ForeignKey("records_metadata.id", name="fk_records_citations_citer_id"),
        nullable=False,
        primary_key=True,
    )
    cited_id = db.Column(
        UUIDType,
        db.ForeignKey("records_metadata.id", name="fk_records_citations_cited_id"),
        nullable=False,
        primary_key=True,
    )
    citation_date = db.Column(Date)
    # Relationship: Relation to record which cites
    # Backref: List of all references of this record
    # which are counted as citations in other records.
    citer = db.relationship(
        RecordMetadata, backref="references", foreign_keys=[citer_id]
    )
    # Relationship: Relation to cited article
    # Backref: List of all citations of this record.
    cited = db.relationship(
        RecordMetadata, backref="citations", foreign_keys=[cited_id]
    )
    is_self_citation = db.Column(Boolean, nullable=False, default=False)


class ConferenceToLiteratureRelationshipType(enum.Enum):
    conference_paper = "conference paper"
    proceedings = "proceedings"


class ConferenceLiterature(db.Model):
    """Keeps track of proceedings and contributions linked to a Conference Record."""

    __tablename__ = "conference_literature"
    __table_args__ = (
        db.Index(
            "ix_conference_literature_conference_uuid",
            "conference_uuid",
            "relationship_type",
        ),
        db.Index("ix_conference_literature_literature_uuid", "literature_uuid"),
    )

    conference_uuid = db.Column(
        UUIDType,
        db.ForeignKey(
            "records_metadata.id", name="fk_conference_literature_conference_uuid"
        ),
        nullable=False,
        primary_key=True,
    )
    literature_uuid = db.Column(
        UUIDType,
        db.ForeignKey(
            "records_metadata.id", name="fk_conference_literature_literature_uuid"
        ),
        nullable=False,
        primary_key=True,
    )
    relationship_type = db.Column(
        Enum(
            ConferenceToLiteratureRelationshipType,
            name="enum_conference_to_literature_relationship_type",
        ),
        primary_key=True,
    )

    conference = db.relationship(
        RecordMetadata, backref="conference_documents", foreign_keys=[conference_uuid]
    )

    conference_document = db.relationship(
        RecordMetadata, backref="conferences", foreign_keys=[literature_uuid]
    )


class InstitutionLiterature(db.Model):
    """Keeps track of papers linked to a Institution Records."""

    __tablename__ = "institution_literature"
    __table_args__ = (
        db.Index("ix_institution_literature_institution_uuid", "institution_uuid"),
        db.Index("ix_institution_literature_literature_uuid", "literature_uuid"),
    )

    institution_uuid = db.Column(
        UUIDType,
        db.ForeignKey(
            "records_metadata.id", name="fk_institution_literature_institution_uuid"
        ),
        nullable=False,
        primary_key=True,
    )
    literature_uuid = db.Column(
        UUIDType,
        db.ForeignKey(
            "records_metadata.id", name="fk_institution_literature_literature_uuid"
        ),
        nullable=False,
        primary_key=True,
    )

    institution = db.relationship(
        RecordMetadata, backref="institution_papers", foreign_keys=[institution_uuid]
    )

    institution_paper = db.relationship(
        RecordMetadata, backref="institutions", foreign_keys=[literature_uuid]
    )


class AuthorSchemaType(enum.Enum):
    collaboration = "collaboration"
    recid = "recid"


class RecordsAuthors(db.Model):
    __tablename__ = "records_authors"
    __table_args__ = (
        db.Index("ix_authors_records_record_id", "record_id"),
        db.Index(
            "ix_authors_records_author_id_id_type_record_id",
            "author_id",
            "id_type",
            "record_id",
        ),
        db.Index("ix_records_authors_id_type_authors_id", "id_type", "author_id"),
    )
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(Text, nullable=False)
    id_type = db.Column(
        ENUM(*[key.value for key in AuthorSchemaType], name="enum_author_schema_type"),
        nullable=False,
    )
    record_id = db.Column(
        UUIDType,
        db.ForeignKey("records_metadata.id", name="fk_authors_records_record_id"),
        nullable=False,
    )


class ExperimentLiterature(db.Model):
    """Keeps track of papers linked to Experiment Records."""

    __tablename__ = "experiment_literature"
    __table_args__ = (
        db.Index("ix_experiment_literature_experiment_uuid", "experiment_uuid"),
        db.Index("ix_experiment_literature_literature_uuid", "literature_uuid"),
    )

    experiment_uuid = db.Column(
        UUIDType,
        db.ForeignKey(
            "records_metadata.id", name="fk_experiment_literature_experiment_uuid"
        ),
        nullable=False,
        primary_key=True,
    )
    literature_uuid = db.Column(
        UUIDType,
        db.ForeignKey(
            "records_metadata.id", name="fk_experiment_literature_literature_uuid"
        ),
        nullable=False,
        primary_key=True,
    )

    experiment = db.relationship(
        RecordMetadata, backref="experiment_papers", foreign_keys=[experiment_uuid]
    )

    experiment_paper = db.relationship(
        RecordMetadata, backref="experiments", foreign_keys=[literature_uuid]
    )


class DegreeType(enum.Enum):
    other = "other"
    diploma = "diploma"
    bachelor = "bachelor"
    laurea = "laurea"
    master = "master"
    phd = "phd"
    habilitation = "habilitation"


class StudentsAdvisors(db.Model):
    """Links students with their thesis advisors"""

    __tablename__ = "students_advisors"
    __table_args__ = (db.Index("ix_students_advisors_student_id", "student_id"),)

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)

    advisor_id = db.Column(
        UUIDType,
        db.ForeignKey("records_metadata.id", name="fk_students_advisors_advisor_id"),
        nullable=False,
    )

    student_id = db.Column(
        UUIDType,
        db.ForeignKey("records_metadata.id", name="fk_students_advisors_student_id"),
        nullable=False,
    )

    degree_type = db.Column(
        ENUM(*[key.value for key in DegreeType], name="enum_degree_type")
    )


class Timestamp(object):
    """Timestamp model mix-in with fractional seconds support.
    SQLAlchemy-Utils timestamp model does not have support for fractional
    seconds.
    """

    created = db.Column(
        db.DateTime(),
        default=datetime.utcnow,
        nullable=True,
    )
    updated = db.Column(
        db.DateTime(),
        default=datetime.utcnow,
        nullable=True,
    )


@db.event.listens_for(Timestamp, "before_update", propagate=True)
def timestamp_before_update(mapper, connection, target):
    """Update `updated` property with current time on `before_update` event."""
    target.updated = datetime.utcnow()


class WorkflowsRecordSources(db.Model, Timestamp):

    __tablename__ = "workflows_record_sources"
    __table_args__ = (db.PrimaryKeyConstraint("record_uuid", "source"),)

    record_uuid = db.Column(
        UUIDType,
        db.ForeignKey("records_metadata.id", ondelete="CASCADE"),
        nullable=False,
    )

    source = db.Column(
        ENUM("arxiv", "submitter", "publisher", name="source_enum"),
        nullable=False,
    )

    json = db.Column(
        JSONB(),
        default=lambda: dict(),
    )


class JournalLiterature(db.Model):
    """Keeps track of papers linked to Journal records."""

    __tablename__ = "journal_literature"
    __table_args__ = (
        db.Index("ix_journal_experiment_journal_uuid", "journal_uuid"),
        db.Index("ix_journal_literature_literature_uuid", "literature_uuid"),
    )

    journal_uuid = db.Column(
        UUIDType,
        db.ForeignKey(
            "records_metadata.id", name="fk_journal_literature_experiment_uuid"
        ),
        nullable=False,
        primary_key=True,
    )
    literature_uuid = db.Column(
        UUIDType,
        db.ForeignKey(
            "records_metadata.id", name="fk_journal_literature_literature_uuid"
        ),
        nullable=False,
        primary_key=True,
    )

    journal = db.relationship(
        RecordMetadata, backref="journal_papers", foreign_keys=[journal_uuid]
    )

    journal_paper = db.relationship(
        RecordMetadata, backref="journals", foreign_keys=[literature_uuid]
    )
