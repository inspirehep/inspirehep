from backoffice.authors.api.views import AuthorWorkflowDocumentView
from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

router = DefaultRouter() if settings.DEBUG else SimpleRouter()


# Workflow
router.register("workflows/search", AuthorWorkflowDocumentView, basename="workflow")

app_name = "search"
urlpatterns = router.urls
