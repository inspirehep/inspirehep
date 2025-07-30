#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Drop CDS Table"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy_utils import UUIDType

# revision identifiers, used by Alembic.
revision = "00e051bc08b2"
down_revision = "503b34c08b0b"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.drop_index("ix_cds_runs_status_date", table_name="cds_runs")
    op.drop_table("cds_runs")

    # Drop enum type manually as it's not removed when table is removed
    op.execute("DROP TYPE enum_cds_run_status;")


def downgrade():
    """Downgrade database."""
    op.create_table(
        "cds_runs",
        sa.Column("task_id", UUIDType, nullable=False),
        sa.Column("date", sa.DateTime(), nullable=True),
        sa.Column("runtime", sa.Interval(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("RUNNING", "FINISHED", "ERROR", name="enum_cds_run_status"),
            nullable=True,
        ),
        sa.Column("message", sa.UnicodeText(), nullable=True),
        sa.PrimaryKeyConstraint("task_id", name=op.f("pk_cds_runs")),
    )
    op.create_index(
        "ix_cds_runs_status_date", "cds_runs", ["status", "date"], unique=False
    )
