#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""modify idx_object index in pidstore_pid table"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "318758a589d5"
down_revision = "49a436a179ac"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.drop_index("idx_object", "pidstore_pid")
    op.create_index("idx_object", "pidstore_pid", ["object_uuid", "object_type"])


def downgrade():
    """Downgrade database."""
    op.drop_index("idx_object", "pidstore_pid")
    op.create_index("idx_object", "pidstore_pid", ["object_type", "object_uuid"])
