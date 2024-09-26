#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""add recid to RecordsAuthors id_type"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "b495825c322b"
down_revision = "0d1cf7c4501e"
branch_labels = ()
depends_on = None


old_enum_values = (
    "INSPIRE ID",
    "INSPIRE BAI",
    "ORCID",
    "JACOW",
    "KAKEN",
    "ARXIV",
    "CERN",
    "DESY",
    "GOOGLESCHOLAR",
    "VIAF",
    "RESEARCHERID",
    "SCOPUS",
    "SPIRES",
    "WIKIPEDIA",
    "SLAC",
    "TWITTER",
    "LINKEDIN",
    "collaboration",
)


def upgrade():
    """Upgrade database."""
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE enum_author_schema_type ADD VALUE IF NOT EXISTS 'recid'")


def downgrade():
    """Downgrade database."""
    op.execute("DELETE FROM records_authors WHERE id_type = 'recid';")
    op.execute("ALTER TABLE records_authors ALTER COLUMN id_type TYPE VARCHAR(255);")
    op.execute("DROP TYPE IF EXISTS enum_author_schema_type;")
    op.execute(f"CREATE TYPE enum_author_schema_type AS ENUM {old_enum_values}")
    op.execute(
        "ALTER TABLE records_authors ALTER COLUMN id_type TYPE enum_author_schema_type"
        " USING (id_type::enum_author_schema_type);"
    )
