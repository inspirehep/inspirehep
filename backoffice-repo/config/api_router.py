from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

from backoffice.users.api.views import UserViewSet
from backoffice.workflows.api.views import (
    AuthorWorkflowViewSet,
    WorkflowPartialUpdateViewSet,
    WorkflowTicketViewSet,
    WorkflowViewSet,
)

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

router.register("users", UserViewSet)

# Workflows
router.register("workflows/authors", AuthorWorkflowViewSet, basename="workflows-authors"),
router.register("workflows", WorkflowViewSet, basename="workflows")
router.register("workflow-update", WorkflowPartialUpdateViewSet, basename="workflow-update")
router.register("workflow-ticket", WorkflowTicketViewSet, basename="workflow-ticket"),
app_name = "api"
urlpatterns = router.urls
