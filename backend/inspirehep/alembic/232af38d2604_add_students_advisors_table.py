#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""add students_advisors table"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql
from sqlalchemy_utils.types import UUIDType

# revision identifiers, used by Alembic.
revision = "232af38d2604"
down_revision = "2d7ea622feda"
branch_labels = ()
depends_on = None


def upgrade():
    """Upgrade database."""
    op.create_table(
        "students_advisors",
        sa.Column("advisor_id", UUIDType, nullable=False),
        sa.Column("student_id", UUIDType, nullable=False),
        sa.Column(
            "degree_type",
            postgresql.ENUM(
                "other",
                "diploma",
                "bachelor",
                "laurea",
                "master",
                "phd",
                "habilitation",
                name="enum_degree_type",
            ),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["advisor_id"],
            ["records_metadata.id"],
            name="fk_students_advisors_advisor_id",
        ),
        sa.ForeignKeyConstraint(
            ["student_id"],
            ["records_metadata.id"],
            name="fk_students_advisors_student_id",
        ),
        sa.PrimaryKeyConstraint(
            "advisor_id", "student_id", name=op.f("pk_students_advisors")
        ),
    )
    op.create_index(
        "ix_students_advisors_student_id",
        "students_advisors",
        ["student_id"],
        unique=False,
    )


def downgrade():
    """Downgrade database."""
    op.drop_index("ix_students_advisors_student_id", table_name="students_advisors")
    op.drop_table("students_advisors")
    op.execute("DROP TYPE enum_degree_type;")
