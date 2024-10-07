from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand

from backoffice.workflows.models import Workflow


class Command(BaseCommand):
    """
    A management command that creates admin and curator groups and gives
    them all permissions to Workflow model.
    To run it, execute the following command:
    >> python manage.py create_groups
    """

    def handle(self, *args, **options):
        admin_group, _ = Group.objects.get_or_create(name="admin")
        curator_group, _ = Group.objects.get_or_create(name="curator")

        content_type = ContentType.objects.get_for_model(Workflow)
        permissions = Permission.objects.filter(content_type=content_type)
        admin_group.permissions.add(*permissions)
        curator_group.permissions.add(*permissions)
        self.stdout.write(
            self.style.SUCCESS(
                """
                Successfully created admin and curator groups and
                gave them all permissions to Workflow model.
                """
            )
        )
