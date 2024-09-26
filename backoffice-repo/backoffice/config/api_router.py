from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

from backoffice.users.api.views import UserViewSet
from backoffice.workflows.api.views import (
    AuthorWorkflowViewSet,
    DecisionViewSet,
    WorkflowTicketViewSet,
    WorkflowViewSet,
)

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)

# Workflows
(
    router.register(
        "workflows/authors", AuthorWorkflowViewSet, basename="workflows-authors"
    ),
)
router.register("workflows", WorkflowViewSet, basename="workflows")
(router.register("workflow-ticket", WorkflowTicketViewSet, basename="workflow-ticket"),)
router.register("decisions", DecisionViewSet, basename="decisions")
app_name = "api"
urlpatterns = router.urls
