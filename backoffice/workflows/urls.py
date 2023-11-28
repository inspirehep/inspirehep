from django.urls import include, path

from backoffice.config.api_router import router

urlpatterns = [
    path("api/", include(router.urls)),
]
