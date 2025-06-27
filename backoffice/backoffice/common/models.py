import uuid
from django.db import models
from backoffice.users.models import User


class BaseWorkflowTicket(models.Model):
    ticket_id = models.CharField(max_length=32, null=False, blank=False)
    ticket_type = models.CharField(max_length=30)
    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BaseWorkflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_type = models.CharField(max_length=30)
    data = models.JSONField()
    status = models.CharField(max_length=30)

    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BaseDecision(models.Model):
    user = models.ForeignKey(
        User,
        to_field="email",
        db_column="email",
        on_delete=models.CASCADE,
    )
    action = models.CharField(max_length=30)

    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
