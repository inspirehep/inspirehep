# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Additional models used by InspireRecords."""
import enum

from invenio_db import db
from invenio_records.models import RecordMetadata
from sqlalchemy import Date, Enum
from sqlalchemy_utils import UUIDType


class RecordCitations(db.Model):
    """Adds Citation table which holds all references
       which are also eligible citations"""

    __tablename__ = "records_citations"

    __table_args__ = (db.Index("ix_records_citations_cited_id", "cited_id"),)

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
