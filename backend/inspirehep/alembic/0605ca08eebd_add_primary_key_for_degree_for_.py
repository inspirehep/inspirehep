#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""add primary key for degree for StudentsAdvisors table"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0605ca08eebd'
down_revision = '0ae62076ae0c'
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.add_column('students_advisors', sa.Column('id', sa.Integer(), nullable=False))



def downgrade():
    """Downgrade database."""
    op.drop_column('students_advisors', 'id')

