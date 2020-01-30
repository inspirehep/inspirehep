# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import copy

from invenio_oauthclient.contrib.orcid import REMOTE_REST_APP as ORCID_REMOTE_REST_APP
from invenio_oauthclient.contrib.orcid import (
    REMOTE_SANDBOX_REST_APP as ORCID_REMOTE_SANDBOX_REST_APP,
)

ORCID_SANDBOX = True
"""This should be ``False`` on other environments."""

# ORCID sandbox ================================================================
REMOTE_SANDBOX_REST_APP = copy.deepcopy(ORCID_REMOTE_SANDBOX_REST_APP)
REMOTE_SANDBOX_REST_APP["authorized_redirect_url"] = "/api/accounts/login_success"
REMOTE_SANDBOX_REST_APP["signup_redirect_url"] = "/api/accounts/signup"

REMOTE_SANDBOX_REST_APP["params"]["request_token_params"] = {
    "scope": " ".join(["/read-limited", "/activities/update", "/person/update"]),
    "show_login": "true",
}
REMOTE_SANDBOX_REST_APP["signup_handler"][
    "setup"
] = "inspirehep.accounts.handlers:account_setup_handler"

# ==============================================================================

# ORCID production =============================================================
REMOTE_REST_APP = copy.deepcopy(ORCID_REMOTE_REST_APP)
REMOTE_REST_APP["authorized_redirect_url"] = "/api/accounts/login_success"
REMOTE_REST_APP["signup_redirect_url"] = "/api/accounts/signup"

REMOTE_REST_APP["params"]["request_token_params"] = {
    "scope": " ".join(["/read-limited", "/activities/update", "/person/update"]),
    "show_login": "true",
}
REMOTE_REST_APP["signup_handler"][
    "setup"
] = "inspirehep.accounts.handlers:account_setup_handler"
# ==============================================================================

# Add remote app
OAUTHCLIENT_REST_REMOTE_APPS = {"orcid": REMOTE_SANDBOX_REST_APP}
