from flask_alembic import Alembic
from sqlalchemy import text

from inspirehep.alembic_helper.db import clean_db


def test_downgrade(app, db):
    alembic = Alembic(app)

    # test 7be4c8b5c5e8
    alembic.downgrade(1)

    assert "workflows_record_sources" not in _get_table_names(db)
    assert "workflows_pending_record" not in _get_table_names(db)
    assert "crawler_workflows_object" not in _get_table_names(db)
    assert "crawler_job" not in _get_table_names(db)
    assert "workflows_audit_logging" not in _get_table_names(db)
    assert "legacy_records_mirror" not in _get_table_names(db)
    assert "workflows_buckets" not in _get_table_names(db)
    assert "workflows_object" not in _get_table_names(db)
    assert "workflows_workflow" not in _get_table_names(db)

    assert "ix_crawler_job_job_id" not in _get_indexes("crawler_job", db)
    assert "ix_crawler_job_scheduled" not in _get_indexes("crawler_job", db)
    assert "ix_crawler_job_spider" not in _get_indexes("crawler_job", db)
    assert "ix_crawler_job_workflow" not in _get_indexes("crawler_job", db)
    assert "ix_workflows_audit_logging_object_id" not in _get_indexes(
        "workflows_audit_logging", db
    )
    assert "ix_workflows_audit_logging_user_id" not in _get_indexes(
        "workflows_audit_logging", db
    )
    assert "ix_legacy_records_mirror_last_updated" not in _get_indexes(
        "legacy_records_mirror", db
    )
    assert "ix_legacy_records_mirror_valid_collection" not in _get_indexes(
        "legacy_records_mirror", db
    )
    assert "ix_workflows_object_data_type" not in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_id_parent" not in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_id_workflow" not in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_status" not in _get_indexes("workflows_object", db)


def test_upgrade(app, db):
    alembic = Alembic(app)
    # go down before first migration
    alembic.downgrade(target="7be4c8b5c5e8")
    # test 7be4c8b5c5e8
    alembic.upgrade(target="7be4c8b5c5e8")

    assert "workflows_record_sources" in _get_table_names(db)
    assert "workflows_pending_record" in _get_table_names(db)
    assert "crawler_workflows_object" in _get_table_names(db)
    assert "crawler_job" in _get_table_names(db)
    assert "workflows_audit_logging" in _get_table_names(db)
    assert "legacy_records_mirror" in _get_table_names(db)
    assert "workflows_buckets" in _get_table_names(db)
    assert "workflows_object" in _get_table_names(db)
    assert "workflows_workflow" in _get_table_names(db)

    assert "ix_crawler_job_job_id" in _get_indexes("crawler_job", db)
    assert "ix_crawler_job_scheduled" in _get_indexes("crawler_job", db)
    assert "ix_crawler_job_spider" in _get_indexes("crawler_job", db)
    assert "ix_crawler_job_workflow" in _get_indexes("crawler_job", db)
    assert "ix_workflows_audit_logging_object_id" in _get_indexes(
        "workflows_audit_logging", db
    )
    assert "ix_workflows_audit_logging_user_id" in _get_indexes(
        "workflows_audit_logging", db
    )
    assert "ix_legacy_records_mirror_last_updated" in _get_indexes(
        "legacy_records_mirror", db
    )
    assert "ix_legacy_records_mirror_valid_collection" in _get_indexes(
        "legacy_records_mirror", db
    )
    assert "ix_workflows_object_data_type" in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_id_parent" in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_id_workflow" in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_status" in _get_indexes("workflows_object", db)


def _get_indexes(tablename, db):
    query = text(
        """
        SELECT indexname
        FROM pg_indexes
        WHERE tablename=:tablename
    """
    ).bindparams(tablename=tablename)

    return [el.indexname for el in db.session.execute(query)]


def _get_sequences(db):
    query = text(
        """
        SELECT relname
        FROM pg_class
        WHERE relkind='S'
    """
    )

    return [el.relname for el in db.session.execute(query)]


def _get_table_names(db):
    return db.engine.table_names()
