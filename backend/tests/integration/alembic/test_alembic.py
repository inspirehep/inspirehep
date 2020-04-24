# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from flask import current_app
from flask_alembic import Alembic
from invenio_db import db
from sqlalchemy import text
from sqlalchemy.engine import reflection


def test_downgrade(app_clean):
    alembic = Alembic(current_app)

    alembic.downgrade(target="5a0e2405b624")
    assert "ix_records_citations_cited_id_citation_type" not in _get_indexes(
        "records_citations"
    )
    assert "ix_records_citations_citer_id_citation_type" not in _get_indexes(
        "records_citations"
    )

    alembic.downgrade(target="595c36d68964")
    assert _check_column_in_table("records_citations", "is_self_citation") is False

    alembic.downgrade(target="cea5fa2e5d2c")

    assert "records_authors" not in _get_table_names()

    assert "ix_records_citations_cited_id" in _get_indexes("records_citations")
    assert "ix_records_citations_cited_id_citer_id" not in _get_indexes(
        "records_citations"
    )

    alembic.downgrade("b0cdab232269")

    assert "institution_literature" not in _get_table_names()
    assert "ix_institution_literature_literature_uuid" not in _get_indexes(
        "institution_literature"
    )
    assert "ix_institution_literature_institution_uuid" not in _get_indexes(
        "institution_literature"
    )

    alembic.downgrade("e5e43ad8f861")

    assert "idx_pidstore_pid_pid_value" not in _get_indexes("pidstore_pid")

    alembic.downgrade(target="f563233434cd")

    assert "enum_conference_to_literature_relationship_type" not in _get_custom_enums()
    assert "conference_literature" not in _get_table_names()
    assert "ix_conference_literature_literature_uuid" not in _get_indexes(
        "conference_literature"
    )
    assert "ix_conference_literature_conference_uuid" not in _get_indexes(
        "conference_literature"
    )

    alembic.downgrade(target="788a3a61a635")

    assert "idx_pid_provider" not in _get_indexes("pidstore_pid")

    alembic.downgrade(target="dc1ae5abe9d6")

    assert "idx_pid_provider" in _get_indexes("pidstore_pid")

    alembic.downgrade(target="c6570e49b7b2")

    assert "records_citations" in _get_table_names()
    assert "ix_records_citations_cited_id" in _get_indexes("records_citations")

    alembic.downgrade(target="5ce9ef759ace")

    assert "record_citations" in _get_table_names()
    assert "records_citations" not in _get_table_names()
    assert "ix_records_citations_cited_id" not in _get_indexes("record_citations")
    assert "idx_citations_cited" in _get_indexes("record_citations")

    alembic.downgrade(target="b646d3592dd5")
    assert "ix_legacy_records_mirror_last_updated" not in _get_indexes(
        "legacy_records_mirror"
    )
    assert "ix_legacy_records_mirror_valid_collection" not in _get_indexes(
        "legacy_records_mirror"
    )
    assert "legacy_records_mirror" not in _get_table_names()

    alembic.downgrade(target="7be4c8b5c5e8")
    assert "idx_citations_cited" not in _get_indexes("record_citations")

    assert "record_citations" not in _get_table_names()


def test_upgrade(app_clean):
    alembic = Alembic(current_app)
    # go down to first migration
    alembic.downgrade(target="b5be5fda2ee7")

    alembic.upgrade(target="b646d3592dd5")

    assert "idx_citations_cited" in _get_indexes("record_citations")

    assert "record_citations" in _get_table_names()

    alembic.upgrade(target="5ce9ef759ace")

    assert "ix_legacy_records_mirror_last_updated" in _get_indexes(
        "legacy_records_mirror"
    )
    assert "ix_legacy_records_mirror_valid_collection" in _get_indexes(
        "legacy_records_mirror"
    )
    assert "legacy_records_mirror" in _get_table_names()

    alembic.upgrade(target="c6570e49b7b2")

    assert "records_citations" in _get_table_names()
    assert "record_citations" not in _get_table_names()

    assert "ix_records_citations_cited_id" in _get_indexes("records_citations")
    assert "idx_citations_cited" not in _get_indexes("records_citations")

    alembic.upgrade(target="dc1ae5abe9d6")

    assert "idx_pid_provider" in _get_indexes("pidstore_pid")

    alembic.upgrade(target="788a3a61a635")

    assert "idx_pid_provider" not in _get_indexes("pidstore_pid")

    alembic.upgrade(target="f563233434cd")

    assert "conference_literature" in _get_table_names()
    assert "ix_conference_literature_literature_uuid" in _get_indexes(
        "conference_literature"
    )
    assert "ix_conference_literature_conference_uuid" in _get_indexes(
        "conference_literature"
    )
    assert "enum_conference_to_literature_relationship_type" in _get_custom_enums()

    alembic.upgrade(target="b0cdab232269")

    assert "idx_pidstore_pid_pid_value" in _get_indexes("pidstore_pid")

    alembic.upgrade(target="cea5fa2e5d2c")

    assert "institution_literature" in _get_table_names()
    assert "ix_institution_literature_literature_uuid" in _get_indexes(
        "institution_literature"
    )
    assert "ix_institution_literature_institution_uuid" in _get_indexes(
        "institution_literature"
    )

    alembic.upgrade(target="595c36d68964")

    assert "records_authors" in _get_table_names()
    assert "ix_authors_records_author_id_id_type_record_id" in _get_indexes(
        "records_authors"
    )
    assert "ix_authors_records_record_id" in _get_indexes("records_authors")

    assert "ix_records_citations_cited_id" not in _get_indexes("records_citations")
    assert "ix_records_citations_cited_id_citer_id" in _get_indexes("records_citations")

    alembic.upgrade(target="5a0e2405b624")
    assert _check_column_in_table("records_citations", "is_self_citation") is True

    alembic.upgrade(target="8ba47044154a")
    assert "ix_records_citations_cited_id_citation_type" in _get_indexes(
        "records_citations"
    )
    assert "ix_records_citations_citer_id_citation_type" in _get_indexes(
        "records_citations"
    )


def _get_indexes(tablename):
    query = text(
        """
        SELECT indexname
        FROM pg_indexes
        WHERE tablename=:tablename
    """
    ).bindparams(tablename=tablename)

    return [el.indexname for el in db.session.execute(query)]


def _get_sequences():
    query = text(
        """
        SELECT relname
        FROM pg_class
        WHERE relkind='S'
    """
    )

    return [el.relname for el in db.session.execute(query)]


def _get_table_names():
    return db.engine.table_names()


def _get_custom_enums():
    query = """ SELECT pg_type.typname AS enumtype,
        pg_enum.enumlabel AS enumlabel
        FROM pg_type
        JOIN pg_enum
            ON pg_enum.enumtypid = pg_type.oid;"""
    return set([a[0] for a in db.session.execute(query)])


def _check_column_in_table(table, column):
    insp = reflection.Inspector.from_engine(db.engine)
    return column in [col["name"] for col in insp.get_columns(table)]
