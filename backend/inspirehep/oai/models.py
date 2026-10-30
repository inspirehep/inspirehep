#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""OAI-PMH models (adapted from invenio-oaiserver)."""

from inspirehep.oai.errors import OAISetSpecUpdateError
from invenio_db import db
from sqlalchemy.orm import validates
from sqlalchemy_utils import Timestamp


class OAISet(db.Model, Timestamp):
    """Information about OAI set."""

    __tablename__ = "oaiserver_set"

    id = db.Column(db.Integer, primary_key=True)
    spec = db.Column(db.String(255), nullable=False, unique=True)
    name = db.Column(db.String(255), index=True)
    description = db.Column(db.Text, nullable=True)
    search_pattern = db.Column(db.Text, nullable=True)

    @validates("spec")
    def validate_spec(self, key, value):
        """Forbid updates of set identifier."""
        if self.spec and self.spec != value:
            raise OAISetSpecUpdateError("Updating spec is not allowed.")
        return value

    def add_record(self, record):
        """Add a record to the OAISet."""
        record.setdefault("_oai", {}).setdefault("sets", [])

        assert not self.has_record(record)

        record["_oai"]["sets"].append(self.spec)

    def remove_record(self, record):
        """Remove a record from the OAISet."""
        assert self.has_record(record)

        record["_oai"]["sets"] = [s for s in record["_oai"]["sets"] if s != self.spec]

    def has_record(self, record):
        """Check if the record belongs to the OAISet."""
        return self.spec in record.get("_oai", {}).get("sets", [])
