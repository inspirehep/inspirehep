from backoffice.authors.api.serializers import AuthorDecisionSerializer
from inspire_utils.record import get_values_for_schema
from backoffice.management.utils import get_opensearch_client
from django.conf import settings

opensearch_client = get_opensearch_client()


def add_author_decision(workflow_id, user, action):
    data = {"workflow": workflow_id, "user": user, "action": action}

    serializer = AuthorDecisionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data


def is_another_author_running(ids):
    """
    Check if there is another author workflow running.
    """

    index_name = settings.OPENSEARCH_INDEX_NAMES.get(settings.AUTHORS_DOCUMENTS)

    schema = "ORCID"

    values = get_values_for_schema(ids, schema)
    for value in values:
        response = opensearch_client.search(
            index=index_name,
            body={
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"data.ids.value.keyword": value}},
                            {"match": {"data.ids.schema": schema}},
                        ],
                        "should": [
                            {"match": {"status": "running"}},
                            {"match": {"status": "approval"}},
                            {"match": {"status": "error"}},
                        ],
                        "minimum_should_match": 1,
                    }
                }
            },
        )
        number_workflows_running = (
            response["hits"]["total"]["value"] if "hits" in response else 0
        )
        if number_workflows_running > 0:
            return True
    return False
