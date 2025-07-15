from backoffice.authors.api.views import AuthorWorkflowDocumentView
from backoffice.hep.api.views import HepWorkflowDocumentView
from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

router = DefaultRouter() if settings.DEBUG else SimpleRouter()


# Workflow
router.register(
    "workflows/authors/search", AuthorWorkflowDocumentView, basename="authors"
)

router.register(
    "workflows/hep/search",
    HepWorkflowDocumentView,
    basename="hep",
)

app_name = "search"
urlpatterns = router.urls
