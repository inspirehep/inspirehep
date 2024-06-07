from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

from backoffice.workflows.api.views import WorkflowDocumentView

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()


# Workflow
router.register("workflow", WorkflowDocumentView, basename="workflow")

app_name = "search"
urlpatterns = router.urls
