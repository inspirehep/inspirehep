# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, abort, jsonify, request
from flask.views import MethodView
from invenio_records_rest.views import pass_record

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.api.literature import import_article
from inspirehep.records.errors import (
    ExistingArticleError,
    ImportArticleError,
    ImportConnectionError,
    ImportParsingError,
    UnknownImportIdentifierError,
)
from inspirehep.search.factories.search import search_factory_without_aggs
from inspirehep.submissions.serializers import literature_v1

from ..search.api import LiteratureSearch

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


@blueprint.route("/literature/import/<path:identifier>", methods=("GET",))
def import_article_view(identifier):
    try:
        article = import_article(identifier)
        return jsonify({"data": literature_v1.dump(article)})

    except ExistingArticleError as e:
        return jsonify(message=str(e)), 409

    except ImportArticleError as e:
        return jsonify(message=str(e)), 404

    except ImportConnectionError as e:
        return jsonify(message=str(e)), 502

    except ImportParsingError as e:
        return jsonify(message=f"The article has an invalid format.\n{e}"), 500

    except UnknownImportIdentifierError:
        return jsonify(message=f"{identifier} is not a recognized identifier."), 400


literature_citations_view = LiteratureCitationsResource.as_view(
    LiteratureCitationsResource.view_name
)
blueprint.add_url_rule(
    '/literature/<pid(lit,record_class="inspirehep.records.api:LiteratureRecord"):pid_value>/citations',
    view_func=literature_citations_view,
)


class AnnualSummaryResource(MethodView):
    view_name = "literature_citations_summary"

    def get(self):
        query, urlkwargs = search_factory_without_aggs(None, LiteratureSearch())
        if not query:
            return jsonify({"data": {}})
        _source = ["_id"]
        query = query.params(_source=_source)
        results = query.scan()

        records = set([result.meta["id"] for result in results])

        db_query = LiteratureRecord.get_citation_annual_summary(records)
        results = {r.year.year: r.sum for r in db_query.all() if r.year}
        return jsonify({"data": results})


annual_summary_view = AnnualSummaryResource.as_view(AnnualSummaryResource.view_name)
blueprint.add_url_rule("/literature/annual_summary/", view_func=annual_summary_view)
