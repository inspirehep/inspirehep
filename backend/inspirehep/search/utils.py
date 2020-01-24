# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app, request
from six import string_types
from werkzeug.utils import import_string

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in


def get_facet_configuration(search_index):
    """Get facet configuration from request.

    It takes also in account the permissions of the current user,
    returning different facets if the user is either logged in or not.

    Args:
        search_index(str): the index for which facets needs to be loaded.

    Returns:
        dict: the configuration for the requested index.

    """
    facet_name = request.values.get("facet_name")

    if is_superuser_or_cataloger_logged_in():
        facet_data = current_app.config["CATALOGER_RECORDS_REST_FACETS"]
    else:
        facet_data = current_app.config["RECORDS_REST_FACETS"]

    facet = facet_data.get(facet_name) or facet_data.get(search_index)

    if isinstance(facet, string_types):
        facet = import_string(facet)

    if callable(facet):
        facet = facet()
    return facet


def minify_painless(script):
    """Remove unneeded whitespace from script."""
    return " ".join(script.split())
