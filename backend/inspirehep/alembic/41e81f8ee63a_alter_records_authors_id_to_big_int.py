#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Alter records_authors id to big_int"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "41e81f8ee63a"
down_revision = "00e051bc08b2"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.alter_column(
        "records_authors",
        "id",
        existing_type=sa.Integer(),
        type_=sa.BigInteger(),
        postgresql_using="id::bigint",
    )


def downgrade():
    """Downgrade database."""
    op.alter_column(
        "records_authors",
        "id",
        existing_type=sa.BigInteger(),
        type_=sa.Integer(),
        postgresql_using="id::integer",
    )
