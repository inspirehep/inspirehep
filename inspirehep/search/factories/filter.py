# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from werkzeug.datastructures import MultiDict
from invenio_records_rest.facets import _query_filter, _post_filter

from ..utils import get_facet_configuration


def inspire_filter_factory(search, index):
    urlkwargs = MultiDict()
    facets = get_facet_configuration(index)

    if facets is not None:
        search, urlkwargs = _query_filter(search, urlkwargs, facets.get("filters", {}))

        search, urlkwargs = _post_filter(
            search, urlkwargs, facets.get("post_filters", {})
        )

    return (search, urlkwargs)
