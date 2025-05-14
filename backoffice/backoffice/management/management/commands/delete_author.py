import uuid
from django.core.management.base import BaseCommand
from django.conf import settings
from opensearchpy.exceptions import NotFoundError
from backoffice.management.utils import get_opensearch_client
from backoffice.authors.models import AuthorWorkflow


class Command(BaseCommand):
    """
    Deletes an AuthorWorkflow from both the database and OpenSearch by UUID.
    Usage:
        python manage.py delete_workflow <uuid>
    """

    def add_arguments(self, parser):
        parser.add_argument(
            "uuid",
            type=uuid.UUID,
            help="A valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)",
        )

    def handle(self, *args, **options):
        client = get_opensearch_client()
        index_name = settings.OPENSEARCH_INDEX_NAMES.get("backoffice.authors.documents")
        uuid_value = str(options["uuid"])

        try:
            client.delete(
                index=index_name,
                id=uuid_value,
            )
            self.stdout.write(
                self.style.SUCCESS(f"[OS] Deleted document: {uuid_value}")
            )
        except NotFoundError:
            self.stdout.write(
                self.style.WARNING(f"[OS] Document not found: {uuid_value}")
            )

        try:
            author = AuthorWorkflow.objects.get(id=uuid_value)
            author.delete()
            self.stdout.write(
                self.style.SUCCESS(f"[DB] Deleted AuthorWorkflow: {uuid_value}")
            )
        except AuthorWorkflow.DoesNotExist:
            self.stdout.write(
                self.style.WARNING(f"[DB] AuthorWorkflow not found: {uuid_value}")
            )
