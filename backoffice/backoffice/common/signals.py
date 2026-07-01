from copy import copy

from django_opensearch_dsl.signals import RealTimeSignalProcessor
from django_opensearch_dsl.registries import registry


from functools import partial
from typing import Any
from django.db import models, transaction


def update_registry_after_commit(instance):
    registry.update(instance)
    registry.update_related(instance)


def delete_from_registry_after_commit(instance):
    registry.delete(instance)
    registry.delete_related(instance)


class OnCommitSignalProcessor(RealTimeSignalProcessor):
    def handle_save(
        self, sender: type[models.Model], instance: models.Model, **kwargs: Any
    ) -> None:
        """Update the instance in model and associated model indices."""

        transaction.on_commit(partial(update_registry_after_commit, instance=instance))

    def handle_pre_delete(
        self, sender: type[models.Model], instance: models.Model, **kwargs: Any
    ) -> None:
        """Delete the instance from model and associated model indices."""

        instance_for_delete = copy(instance)
        transaction.on_commit(
            partial(delete_from_registry_after_commit, instance=instance_for_delete)
        )
