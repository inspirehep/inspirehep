from django.core.paginator import InvalidPage, Page, Paginator
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class OSSearchResultsSetPagination(PageNumberPagination):
    """Executes an opensearch-py ``Search`` and returns its hits and facets."""

    page_size = 10
    page_size_query_param = "size"
    max_page_size = 250

    def paginate_queryset(self, search, request, view=None):
        page_size = self.get_page_size(request)
        page_number = request.query_params.get(self.page_query_param, 1)
        try:
            page_number = int(page_number)
            if page_number < 1:
                raise ValueError
        except ValueError as exc:
            raise NotFound(self.invalid_page_message) from exc

        start = (page_number - 1) * page_size
        self.response = search[start : start + page_size].execute()
        hits = list(self.response.hits)

        paginator = Paginator(range(self.response.hits.total.value), page_size)
        try:
            paginator.validate_number(page_number)
        except InvalidPage as exc:
            raise NotFound(self.invalid_page_message) from exc
        self.page = Page(hits, page_number, paginator)

        if paginator.num_pages > 1 and self.template is not None:
            self.display_page_controls = True
        self.request = request
        return hits

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "facets": self.response.to_dict().get("aggregations", {}),
                "results": data,
            }
        )
