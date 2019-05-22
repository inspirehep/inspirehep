# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Change record_citations to records_citations for consistency"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "c6570e49b7b2"
down_revision = "5ce9ef759ace"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.rename_table("record_citations", "records_citations")


def downgrade():
    """Downgrade database."""
    op.rename_table("records_citations", "record_citations")
