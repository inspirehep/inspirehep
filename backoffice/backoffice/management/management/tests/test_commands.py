from django.core.management import call_command
from io import StringIO
import uuid
from django.test import TransactionTestCase
from django.apps import apps

AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")


class AuthorWorkflowCommandTests(TransactionTestCase):
    def test_success_delete_author(self):
        test_id = 10
        out = StringIO()
        self.workflow = AuthorWorkflow.objects.create(
            data={},
            id=uuid.UUID(int=test_id),
        )

        call_command("delete_author", str(uuid.UUID(int=test_id)), stdout=out)
        self.assertIn("[OS] Deleted document", out.getvalue())
        self.assertIn("[DB] Deleted AuthorWorkflow", out.getvalue())
