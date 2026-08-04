#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from unittest import mock

import pytest
from flask import current_app
from inspirehep.search.ai_search import AiSearchError, run_ai_search, stream_ai_search

ANSWER_TEXT = "See [Aad et al. (2012)](1124337)."


def _streamed(events, status_code=200):
    """Fake the provider's streamed response from a list of events."""
    response = mock.MagicMock(status_code=status_code)
    response.__enter__.return_value = response
    response.iter_lines.return_value = [
        f"data: {json.dumps(event)}" for event in events
    ]
    response.text = json.dumps(events)
    return response


def _text_block_events(text, index=0):
    return [
        {
            "type": "content_block_start",
            "index": index,
            "content_block": {"type": "text", "text": ""},
        },
        {
            "type": "content_block_delta",
            "index": index,
            "delta": {"type": "text_delta", "text": text},
        },
        {"type": "content_block_stop", "index": index},
    ]


def _tool_block_events(name, partial_json_fragments, index=0):
    return [
        {
            "type": "content_block_start",
            "index": index,
            "content_block": {
                "type": "mcp_tool_use",
                "id": f"tool-{index}",
                "name": name,
                "input": {},
                "server_name": "inspirehep",
            },
        },
        *[
            {
                "type": "content_block_delta",
                "index": index,
                "delta": {"type": "input_json_delta", "partial_json": fragment},
            }
            for fragment in partial_json_fragments
        ],
        {"type": "content_block_stop", "index": index},
    ]


def _tool_result_events(total_results, index=1):
    return [
        {
            "type": "content_block_start",
            "index": index,
            "content_block": {
                "type": "mcp_tool_result",
                "tool_use_id": "tool-0",
                "is_error": False,
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(
                            {"total_results": total_results, "papers": [{"a": 1}]}
                        ),
                    }
                ],
            },
        },
        {"type": "content_block_stop", "index": index},
    ]


def _turn(events, stop_reason="end_turn"):
    return _streamed(
        [
            {"type": "message_start"},
            *events,
            {"type": "message_delta", "delta": {"stop_reason": stop_reason}},
            {"type": "message_stop"},
        ]
    )


def _answer_turn(text=ANSWER_TEXT):
    return _turn(_text_block_events(text))


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
        assert run_ai_search("higgs") == {
            "response": ANSWER_TEXT,
            "record_ids": [1124337],
        }


def test_run_ai_search_asks_the_provider_to_stream():
    with mock.patch("requests.post", return_value=_answer_turn()) as requests_post:
        run_ai_search("higgs")
    assert requests_post.call_args.kwargs["json"]["stream"] is True
    assert requests_post.call_args.kwargs["stream"] is True


def test_run_ai_search_lists_each_linked_record_once_in_order():
    text = (
        "See [Aad et al. (2012)](1124337), [CMS (2012)](1124338)"
        " and again [Aad](1124337)."
    )
    with mock.patch("requests.post", return_value=_answer_turn(text)):
        assert run_ai_search("higgs")["record_ids"] == [1124337, 1124338]


def test_run_ai_search_rejects_an_answer_that_links_no_records():
    """Without links there is nothing to list, and it is usually narration."""
    narration = "Let me search more specifically for top mass measurements:"
    with (
        mock.patch("requests.post", return_value=_answer_turn(narration)),
        pytest.raises(AiSearchError),
    ):
        run_ai_search("who measured the top quark mass most precisely")


def test_stream_ai_search_reports_progress_before_the_answer():
    events = [
        *_tool_block_events("search_papers", ['{"query":', ' "hig', 'gs"}']),
        *_tool_result_events(132),
        *_text_block_events(ANSWER_TEXT, index=2),
    ]
    with mock.patch("requests.post", return_value=_turn(events)):
        streamed = list(stream_ai_search("higgs"))

    assert [event["type"] for event in streamed] == [
        "status",
        "tool",
        "tool_result",
        "answer",
        "done",
    ]
    assert streamed[0] == {"type": "status", "stage": "searching"}
    assert streamed[1] == {
        "type": "tool",
        "name": "search_papers",
        "input": {"query": "higgs"},
    }
    assert streamed[-1]["response"] == ANSWER_TEXT


def test_stream_ai_search_summarises_tool_results_without_the_records():
    events = [
        *_tool_block_events("search_papers", ['{"query": "higgs"}']),
        *_tool_result_events(132),
        *_text_block_events(ANSWER_TEXT, index=2),
    ]
    with mock.patch("requests.post", return_value=_turn(events)):
        streamed = list(stream_ai_search("higgs"))

    tool_result = next(e for e in streamed if e["type"] == "tool_result")
    assert tool_result == {
        "type": "tool_result",
        "name": "search_papers",
        "is_error": False,
        "total_results": 132,
    }


def test_stream_ai_search_emits_the_answer_in_chunks():
    events = [
        {
            "type": "content_block_start",
            "index": 0,
            "content_block": {"type": "text", "text": ""},
        },
        *[
            {
                "type": "content_block_delta",
                "index": 0,
                "delta": {"type": "text_delta", "text": chunk},
            }
            for chunk in ("See ", "[Aad et al. (2012)]", "(1124337).")
        ],
        {"type": "content_block_stop", "index": 0},
    ]
    with mock.patch("requests.post", return_value=_turn(events)):
        streamed = list(stream_ai_search("higgs"))

    chunks = [event["text"] for event in streamed if event["type"] == "answer"]
    assert chunks == ["See ", "[Aad et al. (2012)]", "(1124337)."]
    assert "".join(chunks) == ANSWER_TEXT


def test_stream_ai_search_survives_unparsable_tool_input():
    events = [
        *_tool_block_events("search_papers", ['{"query": "hig']),
        *_text_block_events(ANSWER_TEXT, index=1),
    ]
    with mock.patch("requests.post", return_value=_turn(events)):
        streamed = list(stream_ai_search("higgs"))

    tool = next(event for event in streamed if event["type"] == "tool")
    assert tool["input"] == {}
    assert streamed[-1]["response"] == ANSWER_TEXT


def test_run_ai_search_replays_a_paused_turn_to_the_provider():
    turns = [
        _turn(
            _tool_block_events("search_papers", ['{"query": "higgs"}']), "pause_turn"
        ),
        _answer_turn(),
    ]
    with mock.patch("requests.post", side_effect=turns) as requests_post:
        assert run_ai_search("higgs")["response"] == ANSWER_TEXT

    assert requests_post.call_count == 2
    messages = requests_post.call_args.kwargs["json"]["messages"]
    assert [message["role"] for message in messages] == ["user", "assistant"]
    assert messages[1]["content"] == [
        {
            "type": "mcp_tool_use",
            "id": "tool-0",
            "name": "search_papers",
            "input": {"query": "higgs"},
            "server_name": "inspirehep",
        }
    ]


def test_run_ai_search_drops_what_the_model_wrote_before_pausing():
    """Text written between tool calls is narration, not part of the answer."""
    turns = [
        _turn(_text_block_events("Let me search for that first."), "pause_turn"),
        _turn(_text_block_events(ANSWER_TEXT)),
    ]
    with mock.patch("requests.post", side_effect=turns):
        assert run_ai_search("higgs") == {
            "response": ANSWER_TEXT,
            "record_ids": [1124337],
        }


def test_stream_ai_search_tells_the_ui_to_drop_the_narration():
    turns = [
        _turn(_text_block_events("Let me search for that first."), "pause_turn"),
        _turn(_text_block_events(ANSWER_TEXT)),
    ]
    with mock.patch("requests.post", side_effect=turns):
        streamed = list(stream_ai_search("higgs"))

    assert [event["type"] for event in streamed] == [
        "status",
        "answer",
        "answer_reset",
        "status",
        "answer",
        "done",
    ]
    assert streamed[1]["text"] == "Let me search for that first."
    assert streamed[4]["text"] == ANSWER_TEXT


def test_run_ai_search_raises_when_the_model_never_gets_to_an_answer():
    """A tool-call spiral exhausts the output budget without an answer."""
    spiral = _turn(_text_block_events("Let me search more specifically:"), "max_tokens")
    with mock.patch("requests.post", return_value=spiral), pytest.raises(AiSearchError):
        run_ai_search("who measured the top quark mass most precisely")


def test_run_ai_search_gives_up_after_the_configured_turns():
    paused = _turn(_text_block_events(""), "pause_turn")
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
        mock.patch("requests.post", return_value=_turn([], "refusal")),
        pytest.raises(AiSearchError),
    ):
        run_ai_search("something refused")


def test_run_ai_search_raises_on_an_empty_answer():
    with (
        mock.patch("requests.post", return_value=_turn([])),
        pytest.raises(AiSearchError),
    ):
        run_ai_search("higgs")


def test_run_ai_search_raises_on_a_streamed_error():
    error_turn = _streamed(
        [
            {"type": "message_start"},
            {"type": "error", "error": {"type": "overloaded_error", "message": "busy"}},
        ]
    )
    with (
        mock.patch("requests.post", return_value=error_turn),
        pytest.raises(AiSearchError),
    ):
        run_ai_search("higgs")


def test_run_ai_search_raises_when_the_provider_fails():
    failure = _streamed([{"type": "error"}], status_code=500)
    with (
        mock.patch("requests.post", return_value=failure),
        pytest.raises(AiSearchError),
    ):
        run_ai_search("higgs")
