from concurrent.futures import ThreadPoolExecutor
from queue import Queue
from time import monotonic, sleep

import pytest
from django.contrib.auth.models import Group
from django.db import connection, connections
from django.urls import reverse
from rest_framework.test import APIClient

from backoffice.authors.models import AuthorWorkflow
from backoffice.hep.models import HepWorkflow


@pytest.mark.django_db(transaction=True)
@pytest.mark.skipif(
    connection.vendor != "postgresql", reason="Requires PostgreSQL row locks"
)
@pytest.mark.parametrize(
    "model,route,first_patch,second_patch",
    [
        (
            AuthorWorkflow,
            "api:authors-detail",
            {
                "data": {
                    "name": {"value": "Curator, Edited"},
                    "_collections": ["Authors"],
                }
            },
            {"status": "completed"},
        ),
        (
            AuthorWorkflow,
            "api:authors-detail",
            {"status": "completed"},
            {
                "data": {
                    "name": {"value": "Curator, Edited"},
                    "_collections": ["Authors"],
                }
            },
        ),
        (
            HepWorkflow,
            "api:hep-detail",
            {"data": {"titles": [{"title": "Curator's corrected title"}]}},
            {"status": "completed"},
        ),
        (
            HepWorkflow,
            "api:hep-detail",
            {"status": "completed"},
            {"data": {"titles": [{"title": "Curator's corrected title"}]}},
        ),
        (
            HepWorkflow,
            "api:hep-detail",
            {"matches": {"exact": [123]}},
            {"classifier_results": {"core_keywords": ["quantum gravity"]}},
        ),
    ],
    ids=[
        "author-data-then-status",
        "author-status-then-data",
        "hep-data-then-status",
        "hep-status-then-data",
        "hep-matches-then-classifier",
    ],
)
def test_concurrent_patches_preserve_disjoint_fields(
    settings, user, model, route, first_patch, second_patch
):
    settings.OPENSEARCH_DSL_AUTOSYNC = False
    settings.ALLOWED_HOSTS = ["testserver"]
    curator_group, _ = Group.objects.get_or_create(name="curator")
    user.groups.add(curator_group)
    original_data = (
        {"name": {"value": "Author, Original"}, "_collections": ["Authors"]}
        if model is AuthorWorkflow
        else {"titles": [{"title": "Original title"}], "_collections": ["Literature"]}
    )
    workflow = model.objects.create(data=original_data, status="running")
    previous_updated_at = workflow._updated_at
    url = reverse(route, kwargs={"pk": workflow.pk})
    table = connection.ops.quote_name(model._meta.db_table)
    second_pid = Queue()
    second_response = None

    def observe_second_request(execute, sql, params, many, context):
        if sql.startswith("SELECT") and f"FROM {table}" in sql:
            with connection.cursor() as cursor:
                cursor.execute("SELECT pg_backend_pid()")
                second_pid.put(cursor.fetchone()[0])
        return execute(sql, params, many, context)

    def send_second_patch():
        try:
            client = APIClient()
            client.force_authenticate(user=user)
            with connection.execute_wrapper(observe_second_request):
                return client.patch(url, second_patch, format="json")
        finally:
            connections.close_all()

    def overlap_requests(execute, sql, params, many, context):
        nonlocal second_response
        result = execute(sql, params, many, context)
        if sql.startswith(f"UPDATE {table}"):
            # Hold the first PATCH's uncommitted write while the second PATCH
            # reaches the same row. Without a locked read, the second request
            # reads stale fields and waits only when saving them back.
            second_response = executor.submit(send_second_patch)
            pid = second_pid.get(timeout=10)
            deadline = monotonic() + 10
            with connection.cursor() as cursor:
                while monotonic() < deadline:
                    cursor.execute(
                        "SELECT EXISTS (SELECT 1 FROM pg_locks "
                        "WHERE pid = %s AND NOT granted)",
                        [pid],
                    )
                    if cursor.fetchone()[0]:
                        break
                    if second_response.done():
                        pytest.fail(
                            "Concurrent PATCH returned before the first committed: "
                            f"{second_response.result().data}"
                        )
                    sleep(0.01)
                else:
                    pytest.fail("Concurrent PATCH did not wait for the first write")
        return result

    client = APIClient()
    client.force_authenticate(user=user)
    with ThreadPoolExecutor(max_workers=1) as executor:
        with connection.execute_wrapper(overlap_requests):
            first_response = client.patch(url, first_patch, format="json")

    assert first_response.status_code == 200, first_response.data
    assert second_response is not None
    response = second_response.result(timeout=10)
    assert response.status_code == 200, response.data
    workflow.refresh_from_db()
    for field, value in {**first_patch, **second_patch}.items():
        assert getattr(workflow, field) == value
        assert response.data[field] == value
    assert workflow._updated_at > previous_updated_at
