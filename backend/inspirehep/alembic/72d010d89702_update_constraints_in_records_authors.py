#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""update constraints in records_authors"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "72d010d89702"
down_revision = "3637cb5551a8"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.execute("CREATE SEQUENCE records_authors_id_seq OWNED BY records_authors.id;")
    op.execute(
        "SELECT SETVAL('records_authors_id_seq', (select max(id) from records_authors),"
        " false)"
    )
    op.execute(
        "ALTER TABLE records_authors ALTER COLUMN id SET DEFAULT"
        " nextval('records_authors_id_seq');"
    )
    op.execute(
        "ALTER TABLE records_authors ADD CONSTRAINT pk_authors_records PRIMARY KEY (id)"
    )
    op.create_foreign_key(
        "fk_authors_records_record_id",
        "records_authors",
        "records_metadata",
        ["record_id"],
        ["id"],
    )


def downgrade():
    """Downgrade database."""
    op.drop_constraint(
        "fk_authors_records_record_id", "records_authors", type_="foreignkey"
    )
    op.drop_constraint("pk_authors_records", "records_authors", type_="primary")
    op.execute("ALTER TABLE records_authors ALTER COLUMN id DROP DEFAULT;")
    op.execute("DROP SEQUENCE records_authors_id_seq")
