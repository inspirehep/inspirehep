#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""add_inspire_redirection_table"""

import sqlalchemy as sa
from alembic import op

revision = "49a436a179ac"
down_revision = "c9f31d2a189d"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_table(
        "inspire_pidstore_redirect",
        sa.Column("created", sa.DateTime(), nullable=False),
        sa.Column("updated", sa.DateTime(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("original_pid_id", sa.Integer(), nullable=False),
        sa.Column("new_pid_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["new_pid_id"],
            ["pidstore_pid.id"],
            name="fk_inspire_pidstore_redirect_new_pid_id",
        ),
        sa.ForeignKeyConstraint(
            ["original_pid_id"],
            ["pidstore_pid.id"],
            name="fk_inspire_pidstore_redirect_old_pid_id",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_inspire_pidstore_redirect")),
    )
    op.create_index(
        op.f("ix_inspire_pidstore_redirect_new_pid_id"),
        "inspire_pidstore_redirect",
        ["new_pid_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_inspire_pidstore_redirect_original_pid_id"),
        "inspire_pidstore_redirect",
        ["original_pid_id"],
        unique=True,
    )


def downgrade():
    """Downgrade database."""
    op.drop_index(
        op.f("ix_inspire_pidstore_redirect_original_pid_id"),
        table_name="inspire_pidstore_redirect",
    )
    op.drop_index(
        op.f("ix_inspire_pidstore_redirect_new_pid_id"),
        table_name="inspire_pidstore_redirect",
    )
    op.drop_table("inspire_pidstore_redirect")
