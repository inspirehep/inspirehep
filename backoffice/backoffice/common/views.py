import logging
from opensearchpy import A, Q, Search
from rest_framework import viewsets, status
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from inspire_schemas.errors import SchemaKeyNotFound, SchemaNotFound
from inspire_schemas.utils import get_validation_errors
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.settings import api_settings

from backoffice.common.utils import (
    render_validation_error_response,
)
from backoffice.management.utils import get_opensearch_client
from backoffice.utils.pagination import OSSearchResultsSetPagination


logger = logging.getLogger(__name__)

opensearch_client = get_opensearch_client()


class BaseWorkflowTicketViewSet(viewsets.ModelViewSet):
    """
    Base for any WorkflowTicketViewSet.
    Subclasses must define:
      • queryset
      • serializer_class
    """

    def retrieve(self, request, *args, **kwargs):
        workflow_id = kwargs.get("pk")
        ticket_type = request.query_params.get("ticket_type")

        if not workflow_id or not ticket_type:
            return Response(
                {"error": "Both workflow and ticket_type are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            workflow_ticket = self.get_queryset().get(
                workflow=workflow_id, ticket_type=ticket_type
            )
        except self.get_queryset().model.DoesNotExist:
            return Response(
                {"error": "Workflow ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(workflow_ticket)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BaseWorkflowViewSet(viewsets.ModelViewSet):
    """
    Base for any “Workflow” ModelViewSet.
    Subclasses must set:
      • schema_name -> the name of the schema to validate against. Should match the
    schema name in the inspire_schemas package.
    """

    schema_name = None

    @extend_schema(exclude=True)
    def list(self, request, *args, **kwargs):
        raise MethodNotAllowed(request.method)

    def partial_update(self, request, pk=None):
        logger.info(
            "Updating workflow %s with data fields: %s", pk, request.data.keys()
        )
        workflow_instance = get_object_or_404(self.queryset, pk=pk)
        serializer = self.get_serializer(
            workflow_instance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def validate(self, request):
        try:
            record_data = request.data
            validation_errors = list(get_validation_errors(record_data))
            if validation_errors:
                validation_errors_msg = render_validation_error_response(
                    validation_errors
                )
                return Response(
                    validation_errors_msg,
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (SchemaNotFound, SchemaKeyNotFound) as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"message": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(
            {"message": "Record is valid."},
            status=status.HTTP_200_OK,
        )


class BaseWorkflowSearchViewSet(viewsets.GenericViewSet):
    """
    Base for any list-only OpenSearch search ViewSet.
    Returns the raw ``_source`` of each hit.

    Query params:
      • search: ``value`` matches all ``search_fields``,
        ``field:value`` matches only ``field``
      • <filter_fields key>: exact match, repeat it to match any of the values
      • ordering: ``ordering_fields`` keys, ``-`` prefix for descending
      • page / size: see ``OSSearchResultsSetPagination``

    Subclasses must define:
      • document
      • search_fields
      • filter_fields
      • ordering_fields
      • ordering
      • faceted_search_fields
    """

    pagination_class = OSSearchResultsSetPagination
    search_param = api_settings.SEARCH_PARAM
    ordering_param = api_settings.ORDERING_PARAM
    search_field_separator = ":"

    def get_queryset(self):
        search = Search(using=opensearch_client, index=self.document._index._name)
        search = search.extra(track_total_hits=True)
        search = self.apply_search(search)
        search = self.apply_facets(search)
        search = self.apply_filters(search)
        return self.apply_ordering(search)

    def apply_search(self, search):
        queries = []
        for term in self.request.query_params.getlist(self.search_param):
            field, separator, value = term.partition(self.search_field_separator)
            if separator:
                if field in self.search_fields:
                    queries.append(Q("match", **{field: {"query": value}}))
            else:
                queries.extend(
                    Q("match", **{field: {"query": term}})
                    for field in self.search_fields
                )
        if queries:
            search = search.query("bool", should=queries)
        return search

    def apply_facets(self, search):
        for name, facet in self.faceted_search_fields.items():
            search.aggs.bucket(
                f"_filter_{name}", "filter", filter=Q("match_all")
            ).bucket(name, A("terms", field=facet["field"], **facet["options"]))
        return search

    def apply_filters(self, search):
        for param, field in self.filter_fields.items():
            values = [
                value.strip()
                for value in self.request.query_params.getlist(param)
                if value.strip()
            ]
            if values:
                search = search.filter({"terms": {field: values}})
        return search

    def apply_ordering(self, search):
        requested = self.request.query_params.getlist(self.ordering_param)
        valid = [
            param for param in requested if param.lstrip("-") in self.ordering_fields
        ]

        sort = []
        for param in valid or self.ordering:
            field = self.ordering_fields[param.lstrip("-")]
            order = "desc" if param.startswith("-") else "asc"
            sort.append({field: {"order": order}})
        return search.sort(*sort)

    def list(self, request, *args, **kwargs):
        hits = self.paginate_queryset(self.get_queryset())
        return self.get_paginated_response([hit.to_dict() for hit in hits])
