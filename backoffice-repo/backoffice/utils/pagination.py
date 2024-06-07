from django_elasticsearch_dsl_drf.pagination import QueryFriendlyPageNumberPagination
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class OSStandardResultsSetPagination(QueryFriendlyPageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
