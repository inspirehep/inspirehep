from backoffice.users.api.views import UserViewSet
from backoffice.authors.api.views import (
    AuthorWorkflowViewSet,
    AuthorDecisionViewSet,
    AuthorWorkflowTicketViewSet,
)
from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)

# Workflows
(
    router.register(
        "workflows/authors", AuthorWorkflowViewSet, basename="workflows-authors"
    ),
)
router.register("workflows", AuthorWorkflowViewSet, basename="workflows")
(
    router.register(
        "workflow-ticket", AuthorWorkflowTicketViewSet, basename="workflow-ticket"
    ),
)
router.register("decisions", AuthorDecisionViewSet, basename="decisions")
app_name = "api"
urlpatterns = router.urls
