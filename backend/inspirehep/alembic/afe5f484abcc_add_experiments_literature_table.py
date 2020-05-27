#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""add  experiment_literature table"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy_utils.types import UUIDType

# revision identifiers, used by Alembic.
revision = "afe5f484abcc"
down_revision = "020b99d0beb7"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_table(
        "experiment_literature",
        sa.Column("experiment_uuid", UUIDType, nullable=False),
        sa.Column("literature_uuid", UUIDType, nullable=False),
        sa.ForeignKeyConstraint(
            ["experiment_uuid"],
            ["records_metadata.id"],
            name="fk_experiment_literature_experiment_uuid",
        ),
        sa.ForeignKeyConstraint(
            ["literature_uuid"],
            ["records_metadata.id"],
            name="fk_experiment_literature_literature_uuid",
        ),
        sa.PrimaryKeyConstraint(
            "experiment_uuid", "literature_uuid", name=op.f("pk_experiment_literature"),
        ),
    )
    op.create_index(
        "ix_experiment_literature_experiment_uuid",
        "experiment_literature",
        ["experiment_uuid"],
        unique=False,
    )
    op.create_index(
        "ix_experiment_literature_literature_uuid",
        "experiment_literature",
        ["literature_uuid"],
        unique=False,
    )


def downgrade():
    """Downgrade database."""
    op.drop_index(
        "ix_experiment_literature_literature_uuid", table_name="experiment_literature"
    )
    op.drop_index(
        "ix_experiment_literature_experiment_uuid", table_name="experiment_literature",
    )
    op.drop_table("experiment_literature")
