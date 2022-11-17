#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""update values in AuthorSchemaType"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "3637cb5551a8"
down_revision = "b495825c322b"
branch_labels = ()
depends_on = None

new_enum_types = ("collaboration", "recid")

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
    "recid",
)


def upgrade():
    """Upgrade database."""
    op.execute(f"DELETE FROM records_authors WHERE id_type NOT IN {new_enum_types}")
    op.execute("ALTER TABLE records_authors ALTER COLUMN id_type TYPE VARCHAR(255);")
    op.execute("DROP TYPE IF EXISTS enum_author_schema_type;")
    op.execute(f"CREATE TYPE enum_author_schema_type AS ENUM {new_enum_types}")
    op.execute(
        "ALTER TABLE records_authors ALTER COLUMN id_type TYPE enum_author_schema_type USING (id_type::enum_author_schema_type);"
    )


def downgrade():
    """Downgrade database."""
    op.execute("ALTER TABLE records_authors ALTER COLUMN id_type TYPE VARCHAR(255);")
    op.execute("DROP TYPE IF EXISTS enum_author_schema_type;")
    op.execute(f"CREATE TYPE enum_author_schema_type AS ENUM {old_enum_values}")
    op.execute(
        "ALTER TABLE records_authors ALTER COLUMN id_type TYPE enum_author_schema_type USING (id_type::enum_author_schema_type);"
    )
