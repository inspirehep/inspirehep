#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""remove_legacy_records_mirror_table"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "3fd6471bb960"
down_revision = "72d010d89702"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.drop_table("legacy_records_mirror")


def downgrade():
    """Downgrade database."""
    op.create_table(
        "legacy_records_mirror",
        sa.Column("recid", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column(
            "last_updated", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column("marcxml", postgresql.BYTEA(), autoincrement=False, nullable=False),
        sa.Column("valid", sa.BOOLEAN(), autoincrement=False, nullable=True),
        sa.Column("errors", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column("collection", sa.TEXT(), autoincrement=False, nullable=True),
        sa.PrimaryKeyConstraint("recid", name="pk_legacy_records_mirror"),
    )
    op.create_index(
        "ix_legacy_records_mirror_valid_collection",
        "legacy_records_mirror",
        ["valid", "collection"],
        unique=False,
    )
    op.create_index(
        "ix_legacy_records_mirror_last_updated",
        "legacy_records_mirror",
        ["last_updated"],
        unique=False,
    )
