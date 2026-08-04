from unittest.mock import patch

import pytest
from django.apps import apps
from django.db import connection
from django.db.migrations.recorder import MigrationRecorder

from backoffice.common.signals import (
    OnCommitSignalProcessor,
    delete_from_registry_after_commit,
    update_registry_after_commit,
)
from backoffice.hep.models import HepWorkflow


@pytest.fixture
def processor():
    processor = apps.get_app_config("django_opensearch_dsl").signal_processor
    assert isinstance(processor, OnCommitSignalProcessor)
    return processor


@pytest.fixture
def migration_instance():
    return MigrationRecorder.Migration(app="some_app", name="0001_initial")


@patch("django.db.transaction.on_commit")
def test_handle_save_ignores_unregistered_models(
    mock_on_commit, processor, migration_instance
):
    processor.handle_save(sender=type(migration_instance), instance=migration_instance)

    mock_on_commit.assert_not_called()


@patch("django.db.transaction.on_commit")
def test_handle_pre_delete_ignores_unregistered_models(
    mock_on_commit, processor, migration_instance
):
    processor.handle_pre_delete(
        sender=type(migration_instance), instance=migration_instance
    )

    mock_on_commit.assert_not_called()


@patch("django.db.transaction.on_commit")
def test_handle_save_schedules_update_for_registered_model(mock_on_commit, processor):
    workflow = HepWorkflow()

    processor.handle_save(sender=HepWorkflow, instance=workflow)

    mock_on_commit.assert_called_once()
    callback = mock_on_commit.call_args.args[0]
    assert callback.func is update_registry_after_commit
    assert callback.keywords["instance"] is workflow


@patch("django.db.transaction.on_commit")
def test_handle_pre_delete_schedules_delete_for_registered_model(
    mock_on_commit, processor
):
    workflow = HepWorkflow()

    processor.handle_pre_delete(sender=HepWorkflow, instance=workflow)

    mock_on_commit.assert_called_once()
    callback = mock_on_commit.call_args.args[0]
    assert callback.func is delete_from_registry_after_commit
    assert isinstance(callback.keywords["instance"], HepWorkflow)
    assert callback.keywords["instance"] is not workflow


@pytest.mark.django_db
def test_migration_recorder_rows_do_not_break_signal_handlers():
    recorder = MigrationRecorder(connection)

    recorder.record_applied("some_app", "0001_test")
    recorder.record_unapplied("some_app", "0001_test")

    assert not recorder.migration_qs.filter(app="some_app", name="0001_test").exists()
