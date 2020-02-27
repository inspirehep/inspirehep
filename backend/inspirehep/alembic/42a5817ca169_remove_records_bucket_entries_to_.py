#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Remove all data form records_buckets which are connected with records_metadata"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "42a5817ca169"
down_revision = "f563233434cd"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.execute(
        """
        BEGIN;
        SELECT bucket_id INTO TEMP_TO_DELETE FROM records_buckets; 
        TRUNCATE TABLE records_buckets;
        DELETE from files_bucket WHERE id in (
          select f.id from files_bucket f inner join TEMP_TO_DELETE r on f.id = r.bucket_id
        )
        COMMIT;
        """
    )


def downgrade():
    """Downgrade database."""
    pass
