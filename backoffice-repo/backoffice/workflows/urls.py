from django.urls import include, path

urlpatterns = [
    path("workflows/", include("workflows.urls")),
]
