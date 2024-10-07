from django_elasticsearch_dsl_drf.pagination import QueryFriendlyPageNumberPagination


class OSStandardResultsSetPagination(QueryFriendlyPageNumberPagination):
    page_size = 10
    page_size_query_param = "size"
    max_page_size = 100
