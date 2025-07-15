from backoffice.users.api.views import UserViewSet
from backoffice.authors.api.views import (
    AuthorWorkflowViewSet,
    AuthorDecisionViewSet,
    AuthorWorkflowTicketViewSet,
)
from backoffice.hep.api.views import (
    HepWorkflowViewSet,
    HepDecisionViewSet,
    HepWorkflowTicketViewSet,
)
from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)

# Workflows
router.register(
    "workflows/authors/tickets", AuthorWorkflowTicketViewSet, basename="authors-tickets"
)
router.register(
    "workflows/authors/decisions", AuthorDecisionViewSet, basename="authors-decisions"
)
router.register("workflows/authors", AuthorWorkflowViewSet, basename="authors")

router.register(
    "workflows/hep/tickets", HepWorkflowTicketViewSet, basename="hep-tickets"
)
router.register("workflows/hep/decisions", HepDecisionViewSet, basename="hep-decisions")
router.register("workflows/hep", HepWorkflowViewSet, basename="hep")

app_name = "api"
urlpatterns = router.urls
