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
    op.execute(
        "ALTER TABLE records_citations RENAME CONSTRAINT fk_record_citations_cited TO fk_records_citations_cited_id"
    )
    op.execute(
        "ALTER TABLE records_citations RENAME CONSTRAINT fk_record_citations_citer TO fk_records_citations_citer_id"
    )
    op.execute(
        "ALTER INDEX idx_citations_cited RENAME TO ix_records_citations_cited_id"
    )


def downgrade():
    """Downgrade database."""
    op.rename_table("records_citations", "record_citations")
    op.execute(
        "ALTER TABLE record_citations RENAME CONSTRAINT fk_records_citations_cited_id TO fk_record_citations_cited"
    )
    op.execute(
        "ALTER TABLE record_citations RENAME CONSTRAINT fk_records_citations_citer_id TO fk_record_citations_citer"
    )
    op.execute(
        "ALTER INDEX ix_records_citations_cited_id RENAME TO idx_citations_cited"
    )
