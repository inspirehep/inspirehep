import uuid

from django.db import models


class Workflow(models.Model):
    PREPROCESSING = "PREPROCESSING"
    APPROVAL = "APPROVAL"
    POSTPROCESSING = "POSTPROCESSING"
    STATUS_CHOICES = (
        (PREPROCESSING, "Preprocessing"),
        (APPROVAL, "Approval"),
        (POSTPROCESSING, "Postprocessing"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    data = models.JSONField()
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=PREPROCESSING,
    )
    core = models.BooleanField()
    is_update = models.BooleanField()
