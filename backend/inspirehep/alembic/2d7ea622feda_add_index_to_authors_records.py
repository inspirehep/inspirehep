#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""add index to authors_records"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "2d7ea622feda"
down_revision = "412aeb064d68"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    with op.get_context().autocommit_block():
        op.create_index(
            "ix_records_authors_id_type_authors_id",
            "records_authors",
            ["id_type", "author_id"],
            unique=False,
            postgresql_concurrently=True,
        )


def downgrade():
    """Downgrade database."""
    with op.get_context().autocommit_block():
        op.drop_index(
            "ix_records_authors_id_type_authors_id",
            table_name="records_authors",
            postgresql_concurrently=True,
        )
