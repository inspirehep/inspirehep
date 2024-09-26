#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Add is_self_citation column to citation_table"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "5a0e2405b624"
down_revision = "595c36d68964"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.add_column(
        "records_citations",
        sa.Column("is_self_citation", sa.Boolean, nullable=True, default=False),
    )


def downgrade():
    """Downgrade database."""
    op.drop_column("records_citations", "is_self_citation")
