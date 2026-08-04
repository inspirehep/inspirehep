#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from unittest import mock

from helpers.utils import create_user
from inspirehep.search.ai_search import AiSearchError
from inspirehep.search.views import AI_SEARCH_ERROR_MESSAGE
from invenio_accounts.testutils import login_user_via_session


def test_query_parser(inspire_app):
    query = "title"
    with inspire_app.test_client() as client:
        response = client.get(
            f"/search/query-parser?q={query}", content_type="application/json"
        )
    expected = {"match": {"_all": {"operator": "and", "query": "title"}}}
    assert response.status_code == 200
    assert expected == response.json


def test_query_parser_should_return_400_when_query_is_malformed(inspire_app):
    with inspire_app.test_client() as client:
        response = client.get(
            "/search/query-parser?query={}", content_type="application/json"
        )
    assert response.status_code == 400


UI_ORIGIN = {"Origin": "https://inspirehep.net"}


def test_assistant_search(inspire_app, override_config):
    answer = {"response": "The Higgs was discovered in 2012.", "record_ids": [1124337]}
    user = create_user()
    with (
        override_config(
            FEATURE_FLAG_ENABLE_AI_SEARCH=True,
            AI_SEARCH_RECORDS_API_URL="https://inspirehep.net/api",
        ),
        mock.patch(
            "inspirehep.search.views.run_ai_search", return_value=dict(answer)
        ) as mock_run_ai_search,
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant",
            json={"query": "  higgs discovery  "},
            headers=UI_ORIGIN,
        )

    assert response.status_code == 200
    assert response.json == {
        **answer,
        "records_api_url": "https://inspirehep.net/api",
    }
    mock_run_ai_search.assert_called_once_with("higgs discovery")


def _streamed_events(response):
    return [
        json.loads(line[len("data: ") :])
        for line in response.get_data(as_text=True).splitlines()
        if line.startswith("data: ")
    ]


def test_assistant_search_stream(inspire_app, override_config):
    events = [
        {"type": "status", "stage": "searching"},
        {"type": "tool", "name": "search_papers", "input": {"query": "higgs"}},
        {"type": "answer", "text": "See [Aad et al. (2012)](1124337)."},
        {
            "type": "done",
            "response": "See [Aad et al. (2012)](1124337).",
            "record_ids": [1124337],
        },
    ]
    user = create_user()
    with (
        override_config(
            FEATURE_FLAG_ENABLE_AI_SEARCH=True,
            AI_SEARCH_RECORDS_API_URL="https://inspirehep.net/api",
        ),
        mock.patch(
            "inspirehep.search.views.stream_ai_search", return_value=iter(events)
        ) as mock_stream,
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant/stream",
            json={"query": "  higgs discovery  "},
            headers=UI_ORIGIN,
        )
        streamed = _streamed_events(response)

    assert response.status_code == 200
    assert response.mimetype == "text/event-stream"
    assert response.headers["X-Accel-Buffering"] == "no"
    mock_stream.assert_called_once_with("higgs discovery")

    assert streamed[0] == {"type": "status", "stage": "connecting"}
    assert streamed[1:-1] == events[:-1]
    assert streamed[-1] == {
        **events[-1],
        "records_api_url": "https://inspirehep.net/api",
    }


def test_assistant_search_stream_reports_failures_as_an_event(
    inspire_app, override_config
):
    def failing_stream(query):
        yield {"type": "status", "stage": "searching"}
        raise AiSearchError("provider said something internal")

    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=True),
        mock.patch(
            "inspirehep.search.views.stream_ai_search", side_effect=failing_stream
        ),
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant/stream", json={"query": "higgs"}, headers=UI_ORIGIN
        )
        streamed = _streamed_events(response)

    assert response.status_code == 200
    assert streamed[-1]["type"] == "error"
    assert "internal" not in streamed[-1]["message"]


def test_assistant_search_stream_reports_unexpected_failures_too(
    inspire_app, override_config
):
    def crashing_stream(query):
        yield {"type": "status", "stage": "searching"}
        raise RuntimeError("something nobody expected")

    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=True),
        mock.patch(
            "inspirehep.search.views.stream_ai_search", side_effect=crashing_stream
        ),
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant/stream", json={"query": "higgs"}, headers=UI_ORIGIN
        )
        streamed = _streamed_events(response)

    assert response.status_code == 200
    assert streamed[-1] == {"type": "error", "message": AI_SEARCH_ERROR_MESSAGE}


def test_assistant_search_stream_fails_with_a_status_before_it_starts(
    inspire_app, override_config
):
    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=True),
        mock.patch(
            "inspirehep.search.views.stream_ai_search",
            side_effect=AiSearchError("ANTHROPIC_API_KEY is not configured."),
        ),
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant/stream", json={"query": "higgs"}, headers=UI_ORIGIN
        )

    assert response.status_code == 502
    assert "ANTHROPIC_API_KEY" not in response.json["message"]


def test_assistant_search_stream_is_only_for_logged_in_ui_users(
    inspire_app, override_config
):
    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=True),
        mock.patch("inspirehep.search.views.stream_ai_search") as mock_stream,
        inspire_app.test_client() as client,
    ):
        logged_out = client.post(
            "/search/assistant/stream", json={"query": "higgs"}, headers=UI_ORIGIN
        )
        login_user_via_session(client, email=user.email)
        other_origin = client.post(
            "/search/assistant/stream",
            json={"query": "higgs"},
            headers={"Origin": "https://not-inspire.example.com"},
        )

    assert logged_out.status_code == 401
    assert other_origin.status_code == 403
    mock_stream.assert_not_called()


def test_assistant_search_stream_returns_404_when_feature_flag_is_disabled(
    inspire_app, override_config
):
    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=False),
        mock.patch("inspirehep.search.views.stream_ai_search") as mock_stream,
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant/stream", json={"query": "higgs"}, headers=UI_ORIGIN
        )

    assert response.status_code == 404
    mock_stream.assert_not_called()


def test_assistant_search_returns_401_when_not_logged_in(inspire_app, override_config):
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=True),
        mock.patch("inspirehep.search.views.run_ai_search") as mock_run_ai_search,
        inspire_app.test_client() as client,
    ):
        response = client.post(
            "/search/assistant", json={"query": "higgs"}, headers=UI_ORIGIN
        )

    assert response.status_code == 401
    mock_run_ai_search.assert_not_called()


def test_assistant_search_returns_404_when_feature_flag_is_disabled(
    inspire_app, override_config
):
    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=False),
        mock.patch("inspirehep.search.views.run_ai_search") as mock_run_ai_search,
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant", json={"query": "higgs"}, headers=UI_ORIGIN
        )

    assert response.status_code == 404
    mock_run_ai_search.assert_not_called()


def test_assistant_search_returns_403_when_not_called_from_the_ui(
    inspire_app, override_config
):
    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=True),
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        no_origin = client.post("/search/assistant", json={"query": "higgs"})
        other_origin = client.post(
            "/search/assistant",
            json={"query": "higgs"},
            headers={"Origin": "https://not-inspire.example.com"},
        )

    assert no_origin.status_code == 403
    assert other_origin.status_code == 403


def test_assistant_search_returns_400_when_query_is_missing(
    inspire_app, override_config
):
    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=True),
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant", json={"query": "   "}, headers=UI_ORIGIN
        )
    assert response.status_code == 400


def test_assistant_search_hides_provider_errors(inspire_app, override_config):
    user = create_user()
    with (
        override_config(FEATURE_FLAG_ENABLE_AI_SEARCH=True),
        mock.patch(
            "inspirehep.search.views.run_ai_search",
            side_effect=AiSearchError("provider said something internal"),
        ),
        inspire_app.test_client() as client,
    ):
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/search/assistant", json={"query": "higgs"}, headers=UI_ORIGIN
        )

    assert response.status_code == 502
    assert "internal" not in response.json["message"]
