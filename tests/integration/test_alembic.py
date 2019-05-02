from flask_alembic import Alembic
from sqlalchemy import text


def test_downgrade(app, db):
    alembic = Alembic(app)

    alembic.downgrade(target="b646d3592dd5")
    assert "ix_legacy_records_mirror_last_updated" not in _get_indexes(
        "legacy_records_mirror", db
    )
    assert "ix_legacy_records_mirror_valid_collection" not in _get_indexes(
        "legacy_records_mirror", db
    )
    assert "legacy_records_mirror" not in _get_table_names(db)

    alembic.downgrade(target="7be4c8b5c5e8")
    assert "idx_citations_cited" not in _get_indexes("record_citations", db)

    assert "record_citations" not in _get_table_names(db)

    # test 7be4c8b5c5e8
    alembic.downgrade(target="b5be5fda2ee7")
    alembic.downgrade(1)

    assert "ix_records_metadata_json_referenced_records_2_0" not in _get_indexes(
        "records_metadata", db
    )

    assert "workflows_record_sources" not in _get_table_names(db)
    assert "workflows_pending_record" not in _get_table_names(db)
    assert "crawler_workflows_object" not in _get_table_names(db)
    assert "crawler_job" not in _get_table_names(db)
    assert "workflows_audit_logging" not in _get_table_names(db)
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
    assert "ix_workflows_object_data_type" not in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_id_parent" not in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_id_workflow" not in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_status" not in _get_indexes("workflows_object", db)


def test_upgrade(app, db):
    alembic = Alembic(app)
    # go down to first migration
    alembic.downgrade(target="b5be5fda2ee7")

    alembic.upgrade(target="7be4c8b5c5e8")

    assert "workflows_record_sources" in _get_table_names(db)
    assert "workflows_pending_record" in _get_table_names(db)
    assert "crawler_workflows_object" in _get_table_names(db)
    assert "crawler_job" in _get_table_names(db)
    assert "workflows_audit_logging" in _get_table_names(db)
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
    assert "ix_workflows_object_data_type" in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_id_parent" in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_id_workflow" in _get_indexes("workflows_object", db)
    assert "ix_workflows_object_status" in _get_indexes("workflows_object", db)

    assert "ix_records_metadata_json_referenced_records_2_0" in _get_indexes(
        "records_metadata", db
    )

    alembic.upgrade(target="b646d3592dd5")

    assert "idx_citations_cited" in _get_indexes("record_citations", db)

    assert "record_citations" in _get_table_names(db)

    alembic.upgrade(target="5ce9ef759ace")

    assert "ix_legacy_records_mirror_last_updated" in _get_indexes(
        "legacy_records_mirror", db
    )
    assert "ix_legacy_records_mirror_valid_collection" in _get_indexes(
        "legacy_records_mirror", db
    )
    assert "legacy_records_mirror" in _get_table_names(db)


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
