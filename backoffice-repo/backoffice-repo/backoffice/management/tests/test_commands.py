from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management import call_command
from django.test import TestCase

from backoffice.workflows.models import Workflow


class CreateGroupsCommandTestCase(TestCase):
    def test_handle(self):
        call_command("create_groups")

        admin_group = Group.objects.get(name="admin")
        curator_group = Group.objects.get(name="curator")

        content_type = ContentType.objects.get_for_model(Workflow)
        permissions = Permission.objects.filter(content_type=content_type)

        self.assertTrue(admin_group.permissions.all().count() == permissions.count())
        self.assertTrue(curator_group.permissions.all().count() == permissions.count())
