# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from werkzeug.datastructures import MultiDict
from invenio_records_rest.facets import _aggregations

from ..utils import get_facet_configuration


def inspire_facets_factory(search, index):
    urlkwargs = MultiDict()
    facets = get_facet_configuration(index)

    if facets is not None:
        search = _aggregations(search, facets.get("aggs", {}))

    return (search, urlkwargs)
