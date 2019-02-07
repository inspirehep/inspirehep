# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app, request
from six import string_types
from werkzeug.utils import import_string


def get_facet_configuration(search_index):
    facet_name = request.values.get("facet_name")

    from remote_pdb import RemotePdb

    RemotePdb("127.0.0.1", 4444).set_trace()
    facet = current_app.config["RECORDS_REST_FACETS"].get(facet_name)

    if not facet:
        facet = current_app.config["RECORDS_REST_FACETS"].get(search_index)

    if isinstance(facet, string_types):
        facet = import_string(facet)

    if callable(facet):
        facet = facet()
    return facet
