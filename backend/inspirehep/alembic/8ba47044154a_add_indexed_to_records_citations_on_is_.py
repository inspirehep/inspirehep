# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Add indexed to records_citations on is_self_citation column"""

from alembic import op

revision = "8ba47044154a"
down_revision = "5a0e2405b624"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_index(
        "ix_records_citations_cited_id_citation_type",
        "records_citations",
        ["cited_id", "is_self_citation"],
        unique=False,
    )
    op.create_index(
        "ix_records_citations_citer_id_citation_type",
        "records_citations",
        ["citer_id", "is_self_citation"],
        unique=False,
    )


def downgrade():
    """Downgrade database."""
    op.drop_index(
        "ix_records_citations_citer_id_citation_type", table_name="records_citations"
    )
    op.drop_index(
        "ix_records_citations_cited_id_citation_type", table_name="records_citations"
    )
