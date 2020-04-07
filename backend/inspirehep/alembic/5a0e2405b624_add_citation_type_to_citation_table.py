#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Add citation_type to citation_table"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "5a0e2405b624"
down_revision = "b0cdab232269"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.execute("CREATE TYPE enum_citation_type as ENUM ('citation', 'self_citation')")
    op.add_column(
        "records_citations",
        sa.Column(
            "citation_type",
            sa.Enum("citation", "self_citation", name="enum_citation_type"),
            nullable=True,
        ),
    )


def downgrade():
    """Downgrade database."""
    op.drop_column("records_citations", "citation_type")
    op.execute("DROP TYPE enum_citation_type")
