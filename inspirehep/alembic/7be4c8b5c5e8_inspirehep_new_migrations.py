# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Inspirehep initial revision of migrations
which makes db identical like in inspire-next"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "7be4c8b5c5e8"
down_revision = None
branch_labels = ("inspirehep_new",)
depends_on = "dbdbc1b19cf2"


def upgrade():
    # """Upgrade database."""
    op.create_table(
        "workflows_workflow",
        sa.Column("uuid", postgresql.UUID(), autoincrement=False, nullable=False),
        sa.Column("name", sa.VARCHAR(length=255), autoincrement=False, nullable=False),
        sa.Column(
            "created", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column(
            "modified", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column("id_user", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            "extra_data",
            postgresql.JSON(astext_type=sa.Text()),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("status", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.PrimaryKeyConstraint("uuid", name="pk_workflows_workflow"),
    )
    op.create_table(
        "workflows_object",
        sa.Column(
            "id",
            sa.INTEGER(),
            server_default=sa.text("nextval('workflows_object_id_seq'::regclass)"),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "data",
            postgresql.JSON(astext_type=sa.Text()),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "extra_data",
            postgresql.JSON(astext_type=sa.Text()),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("id_workflow", postgresql.UUID(), autoincrement=False, nullable=True),
        sa.Column("status", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column("id_parent", sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column("id_user", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            "created", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column(
            "modified", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column(
            "data_type", sa.VARCHAR(length=150), autoincrement=False, nullable=True
        ),
        sa.Column(
            "callback_pos",
            postgresql.JSON(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["id_parent"],
            ["workflows_object.id"],
            name="fk_workflows_object_id_parent_workflows_object",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["id_workflow"],
            ["workflows_workflow.uuid"],
            name="fk_workflows_object_id_workflow_workflows_workflow",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_workflows_object"),
        postgresql_ignore_search_path=False,
    )
    op.create_index(
        "ix_workflows_object_status", "workflows_object", ["status"], unique=False
    )
    op.create_index(
        "ix_workflows_object_id_workflow",
        "workflows_object",
        ["id_workflow"],
        unique=False,
    )
    op.create_index(
        "ix_workflows_object_id_parent", "workflows_object", ["id_parent"], unique=False
    )
    op.create_index(
        "ix_workflows_object_data_type", "workflows_object", ["data_type"], unique=False
    )
    op.create_table(
        "workflows_buckets",
        sa.Column(
            "workflow_object_id", sa.INTEGER(), autoincrement=False, nullable=False
        ),
        sa.Column("bucket_id", postgresql.UUID(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ["bucket_id"],
            ["files_bucket.id"],
            name="fk_workflows_buckets_bucket_id_files_bucket",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["workflow_object_id"],
            ["workflows_object.id"],
            name="fk_workflows_buckets_workflow_object_id_workflows_object",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "workflow_object_id", "bucket_id", name="pk_workflows_buckets"
        ),
    )
    op.create_table(
        "legacy_records_mirror",
        sa.Column("recid", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column(
            "last_updated", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column("marcxml", postgresql.BYTEA(), autoincrement=False, nullable=False),
        sa.Column("valid", sa.BOOLEAN(), autoincrement=False, nullable=True),
        sa.Column("errors", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column("collection", sa.TEXT(), autoincrement=False, nullable=True),
        sa.PrimaryKeyConstraint("recid", name="pk_legacy_records_mirror"),
    )
    op.create_index(
        "ix_legacy_records_mirror_valid_collection",
        "legacy_records_mirror",
        ["valid", "collection"],
        unique=False,
    )
    op.create_index(
        "ix_legacy_records_mirror_last_updated",
        "legacy_records_mirror",
        ["last_updated"],
        unique=False,
    )
    op.create_table(
        "workflows_audit_logging",
        sa.Column("id", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column(
            "score",
            postgresql.DOUBLE_PRECISION(precision=53),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column("user_action", sa.TEXT(), autoincrement=False, nullable=False),
        sa.Column("decision", sa.TEXT(), autoincrement=False, nullable=False),
        sa.Column("source", sa.TEXT(), autoincrement=False, nullable=False),
        sa.Column("action", sa.TEXT(), autoincrement=False, nullable=False),
        sa.Column(
            "created", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.Column("object_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ["object_id"],
            ["workflows_object.id"],
            name="fk_workflows_audit_logging_object_id_workflows_object",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["accounts_user.id"],
            name="fk_workflows_audit_logging_user_id_accounts_user",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_workflows_audit_logging"),
    )
    op.create_index(
        "ix_workflows_audit_logging_user_id",
        "workflows_audit_logging",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "ix_workflows_audit_logging_object_id",
        "workflows_audit_logging",
        ["object_id"],
        unique=False,
    )
    op.create_table(
        "crawler_job",
        sa.Column("id", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column("job_id", postgresql.UUID(), autoincrement=False, nullable=True),
        sa.Column("spider", sa.VARCHAR(length=255), autoincrement=False, nullable=True),
        sa.Column(
            "workflow", sa.VARCHAR(length=255), autoincrement=False, nullable=True
        ),
        sa.Column("results", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column("status", sa.VARCHAR(length=10), autoincrement=False, nullable=False),
        sa.Column("logs", sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column(
            "scheduled", postgresql.TIMESTAMP(), autoincrement=False, nullable=False
        ),
        sa.PrimaryKeyConstraint("id", name="pk_crawler_job"),
    )
    op.create_index(
        "ix_crawler_job_workflow", "crawler_job", ["workflow"], unique=False
    )
    op.create_index("ix_crawler_job_spider", "crawler_job", ["spider"], unique=False)
    op.create_index(
        "ix_crawler_job_scheduled", "crawler_job", ["scheduled"], unique=False
    )
    op.create_index("ix_crawler_job_job_id", "crawler_job", ["job_id"], unique=False)
    op.create_table(
        "crawler_workflows_object",
        sa.Column("job_id", postgresql.UUID(), autoincrement=False, nullable=False),
        sa.Column("object_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ["object_id"],
            ["workflows_object.id"],
            name="fk_crawler_workflows_object_object_id_workflows_object",
            onupdate="CASCADE",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "job_id", "object_id", name="pk_crawler_workflows_object"
        ),
    )
    op.create_table(
        "workflows_pending_record",
        sa.Column("workflow_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column("record_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ["workflow_id"],
            ["workflows_object.id"],
            name="fk_workflows_pending_record_workflow_id_workflows_object",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("workflow_id", name="pk_workflows_pending_record"),
    )
    op.create_table(
        "workflows_record_sources",
        sa.Column(
            "source",
            postgresql.ENUM("arxiv", "submitter", "publisher", name="source_enum"),
            autoincrement=False,
            nullable=False,
        ),
        sa.Column(
            "record_uuid", postgresql.UUID(), autoincrement=False, nullable=False
        ),
        sa.Column(
            "json",
            postgresql.JSONB(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
        sa.Column(
            "created", postgresql.TIMESTAMP(), autoincrement=False, nullable=True
        ),
        sa.Column(
            "updated", postgresql.TIMESTAMP(), autoincrement=False, nullable=True
        ),
        sa.ForeignKeyConstraint(
            ["record_uuid"],
            ["records_metadata.id"],
            name="fk_workflows_record_sources_record_uuid_records_metadata",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "record_uuid", "source", name="pk_workflows_record_sources"
        ),
    )


def downgrade():
    # """Downgrade database."""
    op.drop_table("workflows_record_sources")
    op.drop_table("workflows_pending_record")
    op.drop_table("crawler_workflows_object")
    op.drop_index("ix_crawler_job_job_id", table_name="crawler_job")
    op.drop_index("ix_crawler_job_scheduled", table_name="crawler_job")
    op.drop_index("ix_crawler_job_spider", table_name="crawler_job")
    op.drop_index("ix_crawler_job_workflow", table_name="crawler_job")
    op.drop_table("crawler_job")
    op.drop_index(
        "ix_workflows_audit_logging_object_id", table_name="workflows_audit_logging"
    )
    op.drop_index(
        "ix_workflows_audit_logging_user_id", table_name="workflows_audit_logging"
    )
    op.drop_table("workflows_audit_logging")
    op.drop_index(
        "ix_legacy_records_mirror_last_updated", table_name="legacy_records_mirror"
    )
    op.drop_index(
        "ix_legacy_records_mirror_valid_collection", table_name="legacy_records_mirror"
    )
    op.drop_table("legacy_records_mirror")
    op.drop_table("workflows_buckets")
    op.drop_index("ix_workflows_object_data_type", table_name="workflows_object")
    op.drop_index("ix_workflows_object_id_parent", table_name="workflows_object")
    op.drop_index("ix_workflows_object_id_workflow", table_name="workflows_object")
    op.drop_index("ix_workflows_object_status", table_name="workflows_object")
    op.drop_table("workflows_object")
    op.drop_table("workflows_workflow")
    op.execute("DROP TYPE IF EXISTS source_enum")
