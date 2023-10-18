from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("workflows/", include("workflows.urls")),
    path("admin/", admin.site.urls),
]