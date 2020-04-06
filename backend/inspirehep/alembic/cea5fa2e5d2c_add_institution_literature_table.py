#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Add 'institution_literature' table."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy_utils.types import UUIDType

# revision identifiers, used by Alembic.

revision = "cea5fa2e5d2c"
down_revision = "b0cdab232269"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_table(
        "institution_literature",
        sa.Column("institution_uuid", UUIDType, nullable=False),
        sa.Column("literature_uuid", UUIDType, nullable=False),
        sa.ForeignKeyConstraint(
            ["institution_uuid"],
            ["records_metadata.id"],
            name="fk_institution_literature_institution_uuid",
        ),
        sa.ForeignKeyConstraint(
            ["literature_uuid"],
            ["records_metadata.id"],
            name="fk_institution_literature_literature_uuid",
        ),
        sa.PrimaryKeyConstraint(
            "institution_uuid",
            "literature_uuid",
            name=op.f("pk_institution_literature"),
        ),
    )
    op.create_index(
        "ix_institution_literature_institution_uuid",
        "institution_literature",
        ["institution_uuid"],
        unique=False,
    )
    op.create_index(
        "ix_institution_literature_literature_uuid",
        "institution_literature",
        ["literature_uuid"],
        unique=False,
    )


def downgrade():
    """Downgrade database."""
    op.drop_index(
        "ix_institution_literature_literature_uuid", table_name="institution_literature"
    )
    op.drop_index(
        "ix_institution_literature_institution_uuid",
        table_name="institution_literature",
    )
    op.drop_table("institution_literature")
