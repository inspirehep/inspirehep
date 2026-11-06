#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Drop oaiserver_set

The OAI sets are now served from ``OAI_SETS`` in ``inspirehep.oai.config``.
"""

from datetime import datetime

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "67d257fb3749"
down_revision = "41e81f8ee63a"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.execute("DROP TABLE IF EXISTS oaiserver_set")


def downgrade():
    """Downgrade database."""
    oaiserver_set = op.create_table(
        "oaiserver_set",
        sa.Column("created", sa.DateTime(), nullable=False),
        sa.Column("updated", sa.DateTime(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("spec", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("search_pattern", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("spec"),
    )
    op.create_index(
        op.f("ix_oaiserver_set_name"), "oaiserver_set", ["name"], unique=False
    )
    now = datetime.utcnow()
    op.bulk_insert(
        oaiserver_set,
        [
            {
                "created": now,
                "updated": now,
                "name": "CDS",
                "spec": "ForCDS",
                "description": "OAI set for CDS.",
            },
            {
                "created": now,
                "updated": now,
                "name": "CERN arXiv",
                "spec": "CERN:arXiv",
                "description": "OAI set for CERN arXiv.",
            },
        ],
    )
