#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

SEARCH_MAX_SEARCH_PAGE_SIZE = 1000

FEATURE_FLAG_ENABLE_AI_SEARCH = False
AI_SEARCH_ANTHROPIC_MODEL = "claude-haiku-4-5"
AI_SEARCH_MCP_SERVER_URL = "https://mcp.inspirebeta.net/mcp"
AI_SEARCH_RECORDS_API_URL = ""
AI_SEARCH_MAX_TOKENS = 4096
AI_SEARCH_MAX_TURNS = 3
AI_SEARCH_REQUEST_TIMEOUT = 45
AI_SEARCH_TOTAL_TIMEOUT = 90
AI_SEARCH_ALLOWED_ORIGINS = [
    "https://inspirehep.net",
    "https://inspirebeta.net",
]

FORBIDDEN_MIMETYPES_FOR_API_FILTERING = [
    "application/vnd+inspire.record.ui+json",
    "application/x-bibtex",
    "text/vnd+inspire.html+html",
    "application/vnd+inspire.latex.eu+x-latex",
    "application/vnd+inspire.latex.us+x-latex",
]
