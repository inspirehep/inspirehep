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

SYSTEM_PROMPT = """You are the INSPIRE literature search assistant, embedded in the search page of inspirehep.net.
Answer the user's question about High Energy Physics literature by searching INSPIRE with the InspireHEP tools that are available to you.

Strict rules:
- This is a single-shot interaction: the user cannot reply to you. Never ask the user a question, never request clarification, never offer follow-ups or say things like "let me know". If the request is ambiguous, make a reasonable assumption and answer.
- Ground your answer in the records you found with the tools, and mention the key papers inline in the prose.
- Write every paper mention as a link in the form [Aad et al. (2012)](1124337), where the text is how you refer to the paper and the number is its INSPIRE control number (inspire_id). Use no other markdown: no headings, no bold, no bullet lists.
- Keep the answer concise: flowing prose, at most about 200 words and at most 10 papers.
- `record_ids` holds the control numbers of exactly the papers you linked in the response, most relevant first: the user sees those records listed as search results below your answer.
"""

ANSWER_SCHEMA = {
    "type": "object",
    "properties": {
        "response": {"type": "string"},
        "record_ids": {"type": "array", "items": {"type": "integer"}},
    },
    "required": ["response", "record_ids"],
    "additionalProperties": False,
}


class AiSearchError(Exception):
    """Raised when the AI assistant search cannot produce a result."""


def run_ai_search(query):
    """Run the AI chain for a literature query and return a result dict.

    Returns ``{"response": str, "record_ids": [int, ...]}``.
    """
    deadline = time.monotonic() + current_app.config["AI_SEARCH_TOTAL_TIMEOUT"]
    return _run_anthropic(query, deadline)


def _get_api_key(env_variable):
    api_key = os.environ.get(env_variable) or current_app.config.get(env_variable)
    if not api_key:
        raise AiSearchError(f"{env_variable} is not configured.")
    return api_key


def _post(url, headers, payload, deadline):
    """POST to the provider, never outliving the chain's time budget."""
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise AiSearchError("The AI assistant took too long to answer.")

    timeout = min(current_app.config["AI_SEARCH_REQUEST_TIMEOUT"], remaining)
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=timeout)
    except requests.Timeout as error:
        raise AiSearchError("The AI assistant took too long to answer.") from error
    except requests.RequestException as error:
        raise AiSearchError(f"Could not reach the AI provider: {error}") from error

    if response.status_code >= 400:
        LOGGER.error(
            "AI search provider request failed",
            status_code=response.status_code,
            body=response.text[:2000],
        )
        raise AiSearchError(
            f"AI provider returned HTTP {response.status_code}: {response.text[:500]}"
        )
    return response.json()


def _run_anthropic(query, deadline):
    api_key = _get_api_key("ANTHROPIC_API_KEY")
    headers = {
        "x-api-key": api_key,
        "anthropic-version": ANTHROPIC_API_VERSION,
        "anthropic-beta": ANTHROPIC_MCP_BETA,
    }
    payload = {
        "model": current_app.config["AI_SEARCH_ANTHROPIC_MODEL"],
        "max_tokens": current_app.config["AI_SEARCH_MAX_TOKENS"],
        "system": SYSTEM_PROMPT,
        "mcp_servers": [
            {
                "type": "url",
                "name": MCP_SERVER_NAME,
                "url": current_app.config["AI_SEARCH_MCP_SERVER_URL"],
            }
        ],
        "tools": [{"type": "mcp_toolset", "mcp_server_name": MCP_SERVER_NAME}],
        "output_config": {"format": {"type": "json_schema", "schema": ANSWER_SCHEMA}},
        "messages": [{"role": "user", "content": query}],
    }

    data = None
    for _ in range(current_app.config["AI_SEARCH_MAX_TURNS"]):
        data = _post(ANTHROPIC_MESSAGES_API_URL, headers, payload, deadline)
        stop_reason = data.get("stop_reason")

        if stop_reason == "pause_turn":
            payload["messages"] = payload["messages"] + [
                {"role": "assistant", "content": data["content"]}
            ]
            continue

        break
    else:
        raise AiSearchError("AI provider did not finish within the allowed turns.")

    if data.get("stop_reason") == "refusal":
        raise AiSearchError("The AI assistant declined to answer this query.")

    return _parse_result(_extract_text(data))


def _extract_text(data):
    return "".join(
        block.get("text", "")
        for block in data.get("content", [])
        if block.get("type") == "text"
    )


def _parse_result(text):
    """Read the answer, which structured outputs guarantee to be JSON."""
    text = text.strip()
    if not text:
        raise AiSearchError("AI provider returned an empty answer.")

    try:
        parsed = json.loads(text)
    except ValueError as error:
        LOGGER.error("AI search answer was not valid JSON", answer=text[:500])
        raise AiSearchError("AI provider returned a malformed answer.") from error

    response = parsed["response"].strip()
    linked_ids = list(
        dict.fromkeys(int(m) for m in LINKED_RECORD_REGEXP.findall(response))
    )
    return {
        "response": response,
        "record_ids": (linked_ids or parsed["record_ids"])[:MAX_RECORD_IDS],
    }
