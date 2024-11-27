from django.db import models
import uuid
from backoffice.common.constants import (
    StatusChoices,
    DEFAULT_STATUS_CHOICE,
    WorkflowType,
    DEFAULT_WORKFLOW_TYPE,
)


class AbstractWorkflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    data = models.JSONField()

    status = models.CharField(
        max_length=30,
        choices=StatusChoices.choices,
        default=DEFAULT_STATUS_CHOICE,
    )

    workflow_type = models.CharField(
        max_length=30,
        choices=WorkflowType.choices,
        default=DEFAULT_WORKFLOW_TYPE,
    )

    _created_at = models.DateTimeField(auto_now_add=True)
    _updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
