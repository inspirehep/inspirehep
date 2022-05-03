#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""add workflow_record_sources table"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql
from sqlalchemy_utils.types.uuid import UUIDType

# revision identifiers, used by Alembic.
revision = "0ae62076ae0c"
down_revision = "232af38d2604"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_table(
        "workflows_record_sources",
        sa.Column("created", sa.DateTime(), nullable=True),
        sa.Column("updated", sa.DateTime(), nullable=True),
        sa.Column("record_uuid", UUIDType(), nullable=False),
        sa.Column(
            "source",
            postgresql.ENUM("arxiv", "submitter", "publisher", name="source_enum"),
            nullable=False,
        ),
        sa.Column("json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(
            ["record_uuid"],
            ["records_metadata.id"],
            name=op.f("fk_workflows_record_sources_record_uuid_records_metadata"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "record_uuid", "source", name=op.f("pk_workflows_record_sources")
        ),
    )


def downgrade():
    """Downgrade database."""
    op.drop_table("workflows_record_sources")
    op.execute("DROP TYPE source_enum;")
