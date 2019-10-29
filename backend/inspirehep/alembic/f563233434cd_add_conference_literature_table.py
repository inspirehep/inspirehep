#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Add 'conference_literature' table."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy_utils.types import UUIDType

# revision identifiers, used by Alembic.

revision = "f563233434cd"
down_revision = "e5e43ad8f861"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_table(
        "conference_literature",
        sa.Column("conference_uuid", UUIDType, nullable=False),
        sa.Column("literature_uuid", UUIDType, nullable=False),
        sa.Column(
            "relationship_type",
            sa.Enum(
                "conference_paper",
                "proceedings",
                name="enum_conference_to_literature_relationship_type",
            ),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["conference_uuid"],
            ["records_metadata.id"],
            name="fk_conference_literature_conference_uuid",
        ),
        sa.ForeignKeyConstraint(
            ["literature_uuid"],
            ["records_metadata.id"],
            name="fk_conference_literature_literature_uuid",
        ),
        sa.PrimaryKeyConstraint(
            "conference_uuid",
            "literature_uuid",
            "relationship_type",
            name=op.f("pk_conference_literature"),
        ),
    )
    op.create_index(
        "ix_conference_literature_conference_uuid",
        "conference_literature",
        ["conference_uuid", "relationship_type"],
        unique=False,
    )
    op.create_index(
        "ix_conference_literature_literature_uuid",
        "conference_literature",
        ["literature_uuid"],
        unique=False,
    )


def downgrade():
    """Downgrade database."""
    op.drop_index(
        "ix_conference_literature_literature_uuid", table_name="conference_literature"
    )
    op.drop_index(
        "ix_conference_literature_conference_uuid", table_name="conference_literature"
    )
    op.drop_table("conference_literature")
    # Drop enum type manually as it's not removed when table is removed
    op.execute("DROP TYPE enum_conference_to_literature_relationship_type;")
