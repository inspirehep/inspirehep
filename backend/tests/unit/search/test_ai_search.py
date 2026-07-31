#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from unittest import mock

import pytest
from flask import current_app
from inspirehep.search.ai_search import AiSearchError, run_ai_search

ANSWER = {"response": "See [Aad et al. (2012)](1124337).", "record_ids": [1124337]}


def _response(payload, status_code=200):
    response = mock.Mock(status_code=status_code)
    response.json.return_value = payload
    response.text = json.dumps(payload)
    return response


def _turn(stop_reason, content):
    return _response({"stop_reason": stop_reason, "content": content})


def _answer_turn():
    return _turn("end_turn", [{"type": "text", "text": json.dumps(ANSWER)}])


@pytest.fixture(autouse=True)
def _api_key():
    with mock.patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test-key"}):
        yield


@pytest.fixture(autouse=True)
def _restore_config():
    """Keep config tweaks from leaking into the other tests."""
    settings = {
        key: value
        for key, value in current_app.config.items()
        if key.startswith("AI_SEARCH_")
    }
    yield
    current_app.config.update(settings)


def test_run_ai_search_returns_the_answer_and_its_records():
    with mock.patch("requests.post", return_value=_answer_turn()):
        assert run_ai_search("higgs") == ANSWER


def test_run_ai_search_lists_only_the_records_linked_in_the_answer():
    answer = {
        "response": "See [Aad et al. (2012)](1124337) and [CMS (2012)](1124338).",
        "record_ids": [1124337, 1124338, 999999],
    }
    turn = _turn("end_turn", [{"type": "text", "text": json.dumps(answer)}])
    with mock.patch("requests.post", return_value=turn):
        assert run_ai_search("higgs")["record_ids"] == [1124337, 1124338]


def test_run_ai_search_falls_back_to_the_models_records_without_links():
    answer = {"response": "No papers matched.", "record_ids": [1124337]}
    turn = _turn("end_turn", [{"type": "text", "text": json.dumps(answer)}])
    with mock.patch("requests.post", return_value=turn):
        assert run_ai_search("higgs")["record_ids"] == [1124337]


def test_run_ai_search_resumes_a_paused_turn():
    turns = [
        _turn("pause_turn", [{"type": "text", "text": ""}]),
        _answer_turn(),
    ]
    with mock.patch("requests.post", side_effect=turns) as requests_post:
        assert run_ai_search("higgs") == ANSWER
    assert requests_post.call_count == 2


def test_run_ai_search_gives_up_after_the_configured_turns():
    paused = _turn("pause_turn", [{"type": "text", "text": ""}])
    current_app.config["AI_SEARCH_MAX_TURNS"] = 2
    with (
        mock.patch("requests.post", return_value=paused) as requests_post,
        pytest.raises(AiSearchError),
    ):
        run_ai_search("higgs")
    assert requests_post.call_count == 2


def test_run_ai_search_does_not_call_the_provider_without_time_budget():
    current_app.config["AI_SEARCH_TOTAL_TIMEOUT"] = -1
    with mock.patch("requests.post") as requests_post, pytest.raises(AiSearchError):
        run_ai_search("higgs")
    requests_post.assert_not_called()


def test_run_ai_search_keeps_each_request_inside_the_time_budget():
    current_app.config["AI_SEARCH_TOTAL_TIMEOUT"] = 5
    current_app.config["AI_SEARCH_REQUEST_TIMEOUT"] = 45
    with mock.patch("requests.post", return_value=_answer_turn()) as requests_post:
        run_ai_search("higgs")
    assert requests_post.call_args.kwargs["timeout"] <= 5


def test_run_ai_search_raises_on_a_refusal():
    with (
        mock.patch("requests.post", return_value=_turn("refusal", [])),
        pytest.raises(AiSearchError),
    ):
        run_ai_search("something refused")


def test_run_ai_search_raises_when_the_provider_fails():
    with (
        mock.patch("requests.post", return_value=_response({"error": "nope"}, 500)),
        pytest.raises(AiSearchError),
    ):
        run_ai_search("higgs")
