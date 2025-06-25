from opensearchpy import OpenSearch
from django.conf import settings


def get_opensearch_client():
    return OpenSearch(**settings.OPENSEARCH_DSL["default"])
