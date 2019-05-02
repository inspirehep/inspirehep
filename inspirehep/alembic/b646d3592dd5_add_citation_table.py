#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Add Citation Table"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy_utils.types import UUIDType

# revision identifiers, used by Alembic.

revision = "b646d3592dd5"
down_revision = "7be4c8b5c5e8"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_table(
        "record_citations",
        sa.Column("citer_id", UUIDType, nullable=False),
        sa.Column("cited_id", UUIDType, nullable=False),
        sa.Column("citation_date", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(
            ["cited_id"], ["records_metadata.id"], name="fk_record_citations_cited"
        ),
        sa.ForeignKeyConstraint(
            ["citer_id"], ["records_metadata.id"], name="fk_record_citations_citer"
        ),
        sa.PrimaryKeyConstraint(
            "citer_id", "cited_id", name=op.f("pk_record_citations")
        ),
    )
    op.create_index(
        "idx_citations_cited", "record_citations", ["cited_id"], unique=False
    )


def downgrade():
    """Downgrade database."""
    op.drop_index("idx_citations_cited", table_name="record_citations")
    op.drop_table("record_citations")
