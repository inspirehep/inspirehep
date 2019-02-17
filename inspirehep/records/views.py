# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from functools import partial

from flask import Blueprint, abort, jsonify, request
from flask.views import MethodView
from invenio_records_rest.views import pass_record

from ..pidstore.api import PidStoreBase
from ..search.api import LiteratureSearch
from ..search.factories.facet import inspire_facets_factory

blueprint = Blueprint("inspirehep_records", __name__, url_prefix="")


class LiteratureCitationsResource(MethodView):
    view_name = "literature_citations"

    @pass_record
    def get(self, pid, record):
        page = request.values.get("page", 1, type=int)
        size = request.values.get("size", 10, type=int)

        if page < 1 or size < 1:
            abort(400)

        citing_records_results = LiteratureSearch.citations(record, page, size)
        citing_records_count = citing_records_results.total
        citing_records = [citation.to_dict() for citation in citing_records_results]

        data = {
            "metadata": {
                "citations": citing_records,
                "citation_count": citing_records_count,
            }
        }
        return jsonify(data)


literature_citations_view = LiteratureCitationsResource.as_view(
    LiteratureCitationsResource.view_name
)
blueprint.add_url_rule(
    '/literature/<pid(lit,record_class="inspirehep.records.api:LiteratureRecord"):pid_value>/citations',
    view_func=literature_citations_view,
)
