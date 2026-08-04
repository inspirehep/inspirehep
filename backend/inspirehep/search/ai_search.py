#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""AI assistant search for "ai:"-prefixed literature queries.

The natural-language query is sent to Claude, which is connected to the public
InspireHEP MCP server, so the model answers by actually searching INSPIRE. The
API is called over plain HTTP with ``requests`` so no new backend dependency is
needed.
"""

import json
import os
import re
import time

import requests
import structlog
from flask import current_app

LOGGER = structlog.getLogger()

ANTHROPIC_MESSAGES_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_API_VERSION = "2023-06-01"
ANTHROPIC_MCP_BETA = "mcp-client-2025-11-20"

MCP_SERVER_NAME = "inspirehep"
MAX_RECORD_IDS = 25
LINKED_RECORD_REGEXP = re.compile(r"\[[^\[\]]+\]\((\d+)\)")
SSE_DATA_PREFIX = "data: "

SYSTEM_PROMPT = """You are the INSPIRE literature search assistant, embedded in the search page of inspirehep.net.
Answer the user's question about High Energy Physics literature by searching INSPIRE with the InspireHEP tools that are available to you.

Strict rules:
- This is a single-shot interaction: the user cannot reply to you. Never ask the user a question, never request clarification, never offer follow-ups or say things like "let me know". If the request is ambiguous, make a reasonable assumption and answer.
- Ground your answer in the records you found with the tools, and mention the key papers inline in the prose.
- Write every paper mention as a link in the form [Aad et al. (2012)](1124337), where the text is how you refer to the paper and the number is its INSPIRE control number (inspire_id). The user sees the papers you link listed as search results below your answer.
- Answer with the prose only. Use no other markdown: no headings, no bold, no bullet lists, no JSON.
- Keep the answer concise: flowing prose, at most about 200 words and at most 10 papers.
- Search at most three times. If the results are not exactly what you hoped for, answer with the most relevant papers you did find instead of searching again, and say what you based the answer on. Never reply with only a remark about searching again.
"""


class AiSearchError(Exception):
    """Raised when the AI assistant search cannot produce a result."""


def _get_api_key(env_variable):
    api_key = os.environ.get(env_variable) or current_app.config.get(env_variable)
    if not api_key:
        raise AiSearchError(f"{env_variable} is not configured.")
    return api_key


def _read_settings():
    """Snapshot the config the chain needs.

    Read eagerly by ``stream_ai_search`` so that the generator it returns can be
    consumed outside the request context, as a streaming response is.
    """
    return {
        "api_key": _get_api_key("ANTHROPIC_API_KEY"),
        "model": current_app.config["AI_SEARCH_ANTHROPIC_MODEL"],
        "mcp_server_url": current_app.config["AI_SEARCH_MCP_SERVER_URL"],
        "max_tokens": current_app.config["AI_SEARCH_MAX_TOKENS"],
        "max_turns": current_app.config["AI_SEARCH_MAX_TURNS"],
        "request_timeout": current_app.config["AI_SEARCH_REQUEST_TIMEOUT"],
        "total_timeout": current_app.config["AI_SEARCH_TOTAL_TIMEOUT"],
    }


def stream_ai_search(query):
    """Run the AI chain for a literature query, reporting progress as it goes.

    Returns an iterator of event dicts, each with a ``type``:

    - ``status``: the chain reached a new stage, e.g. ``{"stage": "searching"}``
    - ``tool``: the model called an MCP tool, with its ``name`` and ``input``
    - ``tool_result``: that tool came back, with a best-effort ``total_results``
    - ``answer``: a chunk of the answer, in ``text``
    - ``done``: the full ``response`` and the ``record_ids`` it links to

    Raises ``AiSearchError``, possibly after some events have been yielded.
    """
    settings = _read_settings()
    return _stream_anthropic(query, settings)


def run_ai_search(query):
    """Run the AI chain and return the finished answer.

    Returns ``{"response": str, "record_ids": [int, ...]}``.
    """
    for event in stream_ai_search(query):
        if event["type"] == "done":
            return {
                "response": event["response"],
                "record_ids": event["record_ids"],
            }
    raise AiSearchError("AI provider did not return an answer.")


def _stream_anthropic(query, settings):
    deadline = time.monotonic() + settings["total_timeout"]
    headers = {
        "x-api-key": settings["api_key"],
        "anthropic-version": ANTHROPIC_API_VERSION,
        "anthropic-beta": ANTHROPIC_MCP_BETA,
    }
    payload = {
        "model": settings["model"],
        "max_tokens": settings["max_tokens"],
        "system": SYSTEM_PROMPT,
        "mcp_servers": [
            {
                "type": "url",
                "name": MCP_SERVER_NAME,
                "url": settings["mcp_server_url"],
            }
        ],
        "tools": [{"type": "mcp_toolset", "mcp_server_name": MCP_SERVER_NAME}],
        "messages": [{"role": "user", "content": query}],
        "stream": True,
    }

    answer = ""
    for _ in range(settings["max_turns"]):
        blocks, stop_reason = yield from _stream_turn(
            payload, headers, settings, deadline
        )
        answer = "".join(
            block.get("text", "") for block in blocks if block.get("type") == "text"
        )

        if stop_reason == "refusal":
            raise AiSearchError("The AI assistant declined to answer this query.")
        if stop_reason == "max_tokens":
            raise AiSearchError("The AI assistant ran out of room before answering.")
        if stop_reason != "pause_turn":
            break

        if answer.strip():
            yield {"type": "answer_reset"}

        payload["messages"] = payload["messages"] + [
            {"role": "assistant", "content": blocks}
        ]
    else:
        raise AiSearchError("AI provider did not finish within the allowed turns.")

    yield _build_done_event(answer)


def _stream_turn(payload, headers, settings, deadline):
    """Consume one streamed message, yielding UI events as they arrive.

    Returns ``(content_blocks, stop_reason)``, the blocks rebuilt from the
    deltas so the turn can be replayed to the model if it paused.
    """
    blocks = {}
    tool_input_json = {}
    tool_names_by_id = {}
    stop_reason = None

    for event in _iter_sse_events(payload, headers, settings, deadline):
        event_type = event.get("type")
        index = event.get("index")

        if event_type == "message_start":
            yield {"type": "status", "stage": "searching"}

        elif event_type == "content_block_start":
            block = dict(event.get("content_block") or {})
            blocks[index] = block
            if block.get("type") == "mcp_tool_use":
                tool_input_json[index] = ""
                tool_names_by_id[block.get("id")] = block.get("name")
            elif block.get("type") == "mcp_tool_result":
                yield _build_tool_result_event(block, tool_names_by_id)

        elif event_type == "content_block_delta":
            delta = event.get("delta") or {}
            if delta.get("type") == "text_delta":
                text = delta.get("text", "")
                block = blocks.setdefault(index, {"type": "text", "text": ""})
                block["text"] = block.get("text", "") + text
                yield {"type": "answer", "text": text}
            elif delta.get("type") == "input_json_delta":
                tool_input_json[index] = tool_input_json.get(index, "") + delta.get(
                    "partial_json", ""
                )

        elif event_type == "content_block_stop":
            block = blocks.get(index) or {}
            if block.get("type") == "mcp_tool_use":
                block["input"] = _load_tool_input(tool_input_json.get(index))
                yield {
                    "type": "tool",
                    "name": block.get("name"),
                    "input": block["input"],
                }

        elif event_type == "message_delta":
            stop_reason = (event.get("delta") or {}).get("stop_reason") or stop_reason

        elif event_type == "error":
            error = event.get("error") or {}
            LOGGER.error("AI provider streamed an error", error=error)
            raise AiSearchError(
                f"AI provider streamed an error: {error.get('message', 'unknown')}"
            )

    return [blocks[index] for index in sorted(blocks)], stop_reason


def _iter_sse_events(payload, headers, settings, deadline):
    """Yield the provider's server-sent events as they arrive."""
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise AiSearchError("The AI assistant took too long to answer.")

    timeout = min(settings["request_timeout"], remaining)
    try:
        with requests.post(
            ANTHROPIC_MESSAGES_API_URL,
            json=payload,
            headers=headers,
            timeout=timeout,
            stream=True,
        ) as response:
            if response.status_code >= 400:
                LOGGER.error(
                    "AI search provider request failed",
                    status_code=response.status_code,
                    body=response.text[:2000],
                )
                raise AiSearchError(
                    f"AI provider returned HTTP {response.status_code}:"
                    f" {response.text[:500]}"
                )

            for line in response.iter_lines(decode_unicode=True):
                if time.monotonic() > deadline:
                    raise AiSearchError("The AI assistant took too long to answer.")
                if not line or not line.startswith(SSE_DATA_PREFIX):
                    continue
                raw_event = line[len(SSE_DATA_PREFIX) :]
                try:
                    yield json.loads(raw_event)
                except ValueError:
                    LOGGER.warning(
                        "Ignoring unparsable event from AI provider",
                        event=raw_event[:200],
                    )
    except requests.Timeout as error:
        raise AiSearchError("The AI assistant took too long to answer.") from error
    except requests.RequestException as error:
        raise AiSearchError(f"Could not reach the AI provider: {error}") from error


def _load_tool_input(partial_json):
    """Rebuild a tool's arguments from the JSON fragments it streamed in."""
    if not partial_json:
        return {}
    try:
        parsed = json.loads(partial_json)
    except ValueError:
        LOGGER.warning("Could not parse streamed tool input", input=partial_json[:200])
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _build_tool_result_event(block, tool_names_by_id):
    """Summarise a tool result for the UI, without shipping the whole payload."""
    event = {
        "type": "tool_result",
        "name": tool_names_by_id.get(block.get("tool_use_id")),
        "is_error": bool(block.get("is_error")),
    }
    for part in block.get("content") or []:
        if part.get("type") != "text":
            continue
        try:
            payload = json.loads(part.get("text", ""))
        except ValueError:
            continue
        if isinstance(payload, dict) and "total_results" in payload:
            event["total_results"] = payload["total_results"]
            break
    return event


def _build_done_event(answer):
    """Close the stream with the answer and the records it links to."""
    answer = answer.strip()
    if not answer:
        raise AiSearchError("AI provider returned an empty answer.")

    record_ids = list(
        dict.fromkeys(int(match) for match in LINKED_RECORD_REGEXP.findall(answer))
    )
    if not record_ids:
        LOGGER.error("AI search answer linked no records", answer=answer[:500])
        raise AiSearchError("The AI assistant did not find any papers to answer with.")

    return {
        "type": "done",
        "response": answer,
        "record_ids": record_ids[:MAX_RECORD_IDS],
    }
