# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Add authors to records table and update index on records_citations"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy_utils import UUIDType

from inspirehep.records.models import AuthorSchemaType

revision = "595c36d68964"
down_revision = "cea5fa2e5d2c"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_table(
        "records_authors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Text(), nullable=False),
        sa.Column(
            "id_type",
            ENUM(
                *[key.value for key in AuthorSchemaType], name="enum_author_schema_type"
            ),
            nullable=False,
        ),
        sa.Column("record_id", UUIDType, nullable=False),
        sa.ForeignKeyConstraint(
            ["record_id"], ["records_metadata.id"], name="fk_authors_records_record_id"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_authors_records")),
    )
    op.create_index(
        "ix_authors_records_author_id_id_type_record_id",
        "records_authors",
        ["author_id", "id_type", "record_id"],
        unique=False,
    )
    op.create_index(
        "ix_authors_records_record_id", "records_authors", ["record_id"], unique=False
    )
    op.create_index(
        "ix_records_citations_cited_id_citer_id",
        "records_citations",
        ["cited_id", "citer_id"],
        unique=False,
    )
    op.drop_index("ix_records_citations_cited_id", table_name="records_citations")


def downgrade():
    """Downgrade database."""
    op.create_index(
        "ix_records_citations_cited_id", "records_citations", ["cited_id"], unique=False
    )
    op.drop_index(
        "ix_records_citations_cited_id_citer_id", table_name="records_citations"
    )
    op.drop_index("ix_authors_records_record_id", table_name="records_authors")
    op.drop_index(
        "ix_authors_records_author_id_id_type_record_id", table_name="records_authors"
    )
    op.drop_table("records_authors")
    op.execute("DROP TYPE enum_author_schema_type;")
