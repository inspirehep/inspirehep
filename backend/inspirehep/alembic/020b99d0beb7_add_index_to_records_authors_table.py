#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Add index to records authors table"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "020b99d0beb7"
down_revision = "8ba47044154a"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_index(
        "ix_records_authors_id_type_record_id",
        "records_authors",
        ["id_type", "record_id"],
        unique=False,
    )


def downgrade():
    """Downgrade database."""
    op.drop_index("ix_records_authors_id_type_record_id", table_name="records_authors")
