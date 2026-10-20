#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime
import functools
import os
import time
import uuid

import requests
import structlog
from flask import current_app

LOGGER = structlog.getLogger()

ANTHROPIC_PROVIDER = "anthropic"

TRACES_BATCH_PATH = "/v1/private/traces/batch"
SPANS_BATCH_PATH = "/v1/private/spans/batch"
PROMPT_RETRIEVE_PATH = "/v1/private/prompts/versions/retrieve"

REQUEST_TIMEOUT_SECONDS = 5
PROMPT_CACHE_TTL_SECONDS = 300

_prompt_cache = {}


def _now():
    return datetime.datetime.now(datetime.UTC)


def _timestamp(moment):
    return moment.isoformat().replace("+00:00", "Z")


def _uuid7():
    milliseconds = int(time.time() * 1000)
    raw = bytearray(milliseconds.to_bytes(6, "big") + os.urandom(10))
    raw[6] = (raw[6] & 0x0F) | 0x70
    raw[8] = (raw[8] & 0x3F) | 0x80
    return str(uuid.UUID(bytes=bytes(raw)))


def _never_fails(method):
    @functools.wraps(method)
    def wrapper(*args, **kwargs):
        try:
            return method(*args, **kwargs)
        except Exception:
            LOGGER.warning("AI search tracing call failed", method=method.__name__)
            return None

    return wrapper


def _tracing_enabled():
    return bool(current_app.config.get("FEATURE_FLAG_ENABLE_AI_SEARCH_TRACING", False))


def _base_url():
    return (os.environ.get("OPIK_URL_OVERRIDE") or "").rstrip("/")


def _project_name():
    return os.environ.get("OPIK_PROJECT_NAME") or None


def _environment():
    return os.environ.get("OPIK_ENVIRONMENT") or None


def _headers():
    return {
        "Content-Type": "application/json",
        "Comet-Workspace": os.environ.get("OPIK_WORKSPACE") or "default",
    }


def _post(path, payload, quiet_statuses=()):
    """POST to Opik, reporting failure as a log line rather than an exception.

    ``quiet_statuses`` are expected outcomes rather than problems, and are passed
    over without a log line.
    """
    base = _base_url()
    if not base:
        return None
    response = requests.post(
        f"{base}{path}",
        json=payload,
        headers=_headers(),
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    if response.status_code in quiet_statuses:
        return None
    if response.status_code >= 400:
        LOGGER.warning(
            "Opik rejected a tracing request",
            path=path,
            status_code=response.status_code,
            body=response.text[:200],
        )
        return None
    return response


def _usage(anthropic_usage):
    """Opik's token fields, derived from Anthropic's.

    Opik prices a span off prompt_tokens/completion_tokens, so the raw Anthropic
    counters have to be mapped rather than passed through. All three input
    counters are billable — cached prompt tokens included — and Anthropic
    documents summing them, which matters here because the system prompt is
    identical on every search and so is a prime candidate for caching. The
    originals are kept alongside for reference.
    """
    if not anthropic_usage:
        return None

    prompt_tokens = (
        (anthropic_usage.get("input_tokens") or 0)
        + (anthropic_usage.get("cache_read_input_tokens") or 0)
        + (anthropic_usage.get("cache_creation_input_tokens") or 0)
    )
    completion_tokens = anthropic_usage.get("output_tokens") or 0

    usage = {
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": prompt_tokens + completion_tokens,
    }
    usage.update(
        {
            f"original_usage.{key}": value
            for key, value in anthropic_usage.items()
            if isinstance(value, int)
        }
    )
    return usage


def _prune(payload):
    """Drop unset keys so Opik applies its own defaults rather than nulls."""
    return {key: value for key, value in payload.items() if value is not None}


def system_prompt(default):
    """The current system prompt, falling back to the one bundled in the code.

    Opik is the source of truth so the prompt can be edited and promoted between
    environments without a release, but it is never allowed to be a hard
    dependency: any problem fetching it returns ``default``.

    The lookup is scoped to ``OPIK_ENVIRONMENT``, so an edit only reaches this
    deployment once that version has been promoted to its environment in Opik.
    Until someone promotes one, the environment resolves to nothing and the
    bundled default is what runs — staging is opt-in, never accidental.

    Returns ``(prompt_text, metadata)``, the metadata recording which version was
    used so the trace can carry it.
    """
    bundled = (default, {"prompt_source": "bundled"})
    try:
        if not _tracing_enabled():
            return bundled

        name = current_app.config.get("AI_SEARCH_OPIK_PROMPT_NAME")
        if not name:
            return bundled

        cached = _prompt_cache.get(name)
        if cached and cached["expires_at"] > time.monotonic():
            return cached["value"]

        response = _post(
            PROMPT_RETRIEVE_PATH,
            _prune(
                {
                    "name": name,
                    "environment": _environment(),
                    "project_name": _project_name(),
                }
            ),
            quiet_statuses=(404,),
        )
        found = bundled
        if response is not None:
            version = response.json()
            if version.get("template"):
                found = (
                    version["template"],
                    {
                        "prompt_source": "opik",
                        "prompt_name": name,
                        "prompt_version": version.get("version_number"),
                    },
                )
        _prompt_cache[name] = {
            "value": found,
            "expires_at": time.monotonic() + PROMPT_CACHE_TTL_SECONDS,
        }
        return found
    except Exception:
        LOGGER.warning("Could not fetch the system prompt from Opik; using the default")
        return bundled


class _NullTurn:
    def tool_requested(self, *args, **kwargs):
        pass

    def record_tool(self, *args, **kwargs):
        pass

    def end(self, *args, **kwargs):
        pass


class _NullTrace:
    def turn(self, *args, **kwargs):
        return _NullTurn()

    def end(self, *args, **kwargs):
        pass

    def failed(self, *args, **kwargs):
        pass

    def send(self, *args, **kwargs):
        pass


class _Turn:
    """One request to the model, plus the tool calls it made."""

    def __init__(self, trace, number, messages, model):
        self._trace = trace
        self._number = number
        self._messages = messages
        self._model = model
        self._start = _now()
        self._requested_at = {}
        self._tools = []

    @_never_fails
    def tool_requested(self, tool_use_id):
        """Note when the model finished asking for a tool.

        The call itself runs inside Anthropic, which reaches the MCP server
        directly, so this is the closest thing to a start time we can observe.
        """
        self._requested_at[tool_use_id] = _now()

    @_never_fails
    def record_tool(self, tool_use_id, name, tool_input, output, is_error=False):
        self._tools.append(
            {
                "name": name or "mcp_tool",
                "input": (
                    tool_input
                    if isinstance(tool_input, dict)
                    else {"input": tool_input}
                ),
                "output": output,
                "is_error": is_error,
                "start": self._requested_at.get(tool_use_id, self._start),
                "end": _now(),
            }
        )

    @_never_fails
    def end(self, blocks, usage, stop_reason):
        span_id = _uuid7()
        self._trace.add_span(
            _prune(
                {
                    "id": span_id,
                    "name": f"anthropic-turn-{self._number}",
                    "type": "llm",
                    "start_time": _timestamp(self._start),
                    "end_time": _timestamp(_now()),
                    "input": {"messages": self._messages},
                    "output": {"blocks": blocks, "stop_reason": stop_reason},
                    "usage": _usage(usage),
                    "model": self._model,
                    "provider": ANTHROPIC_PROVIDER,
                }
            )
        )
        for tool in self._tools:
            self._trace.add_span(
                _prune(
                    {
                        "id": _uuid7(),
                        "parent_span_id": span_id,
                        "name": tool["name"],
                        "type": "tool",
                        "start_time": _timestamp(tool["start"]),
                        "end_time": _timestamp(tool["end"]),
                        "input": tool["input"],
                        "output": tool["output"],
                        "error_info": (
                            {"exception_type": "ToolError", "traceback": ""}
                            if tool["is_error"]
                            else None
                        ),
                    }
                )
            )


class _Trace:
    """One user-visible AI search.

    Everything is buffered and written by :meth:`send`, which the caller runs
    once the answer has reached the client.
    """

    def __init__(self, query, metadata):
        self._id = _uuid7()
        self._query = query
        self._metadata = metadata
        self._start = _now()
        self._spans = []
        self._trace = None

    def add_span(self, span):
        self._spans.append(span)

    def turn(self, number, messages, model):
        try:
            return _Turn(self, number, messages, model)
        except Exception:
            LOGGER.warning("Could not open an Opik span for an AI search turn")
            return _NullTurn()

    def _build(self, output=None, error_info=None):
        self._trace = _prune(
            {
                "id": self._id,
                "name": "ai-search",
                "start_time": _timestamp(self._start),
                "end_time": _timestamp(_now()),
                "input": {"query": self._query},
                "output": output,
                "metadata": self._metadata,
                "error_info": error_info,
            }
        )

    @_never_fails
    def end(self, answer, record_ids):
        self._build(output={"response": answer, "record_ids": record_ids})

    @_never_fails
    def failed(self, error):
        self._build(
            error_info={
                "exception_type": type(error).__name__,
                "message": str(error),
                "traceback": "",
            }
        )

    @_never_fails
    def send(self):
        """Write the trace and its spans. Safe to call more than once."""
        if self._trace is None:
            return
        project = _project_name()
        environment = _environment()
        common = _prune({"project_name": project, "environment": environment})

        if self._spans:
            _post(
                SPANS_BATCH_PATH,
                {
                    "spans": [
                        {**span, **common, "trace_id": self._id} for span in self._spans
                    ]
                },
            )
        _post(TRACES_BATCH_PATH, {"traces": [{**self._trace, **common}]})
        self._trace = None
        self._spans = []


def start(query, metadata):
    """Open a trace for one search, or a no-op stand-in if tracing is off."""
    try:
        if not _tracing_enabled() or not _base_url():
            return _NullTrace()
        return _Trace(query, metadata)
    except Exception:
        LOGGER.warning("Could not start an Opik trace for the AI search")
        return _NullTrace()
