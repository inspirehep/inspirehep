#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Add index for ObjectVersion.key"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "e5e43ad8f861"
down_revision = "788a3a61a635"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_index(
        "ix_files_object_key_head", "files_object", ["key", "is_head"], unique=False
    )


def downgrade():
    """Downgrade database."""
    op.drop_index("ix_files_object_key_head", table_name="files_object")
