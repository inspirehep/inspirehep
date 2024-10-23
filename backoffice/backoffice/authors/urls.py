from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

from backoffice.authors.api.views import (
    AuthorDecisionViewSet,
    AuthorWorkflowTicketViewSet,
    AuthorWorkflowViewSet,
)

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

# Workflows
router.register("authors", AuthorWorkflowViewSet, basename="authors")
router.register(
    "authors/tickets", AuthorWorkflowTicketViewSet, basename="author-tickets"
)
router.register("authors/decisions", AuthorDecisionViewSet, basename="author-decisions")
app_name = "authors"
