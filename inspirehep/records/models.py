# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Additional models used by InspireRecords."""


import logging

from invenio_db import db
from invenio_records.models import RecordMetadata
from sqlalchemy import Date
from sqlalchemy_utils import UUIDType

logger = logging.getLogger(__name__)


class CitationTable(db.Model):
    """Adds Citation table which holds all references
       which are also eligible citations"""

    __tablename__ = "citation_table"

    __table_args__ = (
        db.Index("idx_citations_citers", "citer_id"),
        db.Index("idx_citations_cited", "cited_id"),
    )

    CiterId = db.Column(
        "citer_id",
        UUIDType,
        db.ForeignKey("records_metadata.id", name="fk_citation_table_citer"),
        nullable=False,
        primary_key=True,
    )
    CitedId = db.Column(
        "cited_id",
        UUIDType,
        db.ForeignKey("records_metadata.id", name="fk_citation_table_cited"),
        nullable=False,
        primary_key=True,
    )
    CitationDate = db.Column("citation_date", Date)
    # Relationship: TODO - Add explanation
    # Backref: TODO - Add explanation
    Citer = db.relationship(RecordMetadata, backref="Citations", foreign_keys=[CiterId])
    # Relationship: TODO - Add explanation
    # Backref: TODO - Add explanation
    Cited = db.relationship(
        RecordMetadata, backref="References", foreign_keys=[CitedId]
    )
