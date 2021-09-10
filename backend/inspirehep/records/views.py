# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from flask import Blueprint, abort, current_app, request
from flask.views import MethodView
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_records.api import RecordMetadata
from invenio_records_rest.views import pass_record
from webargs import fields
from webargs.flaskparser import FlaskParser

from inspirehep.accounts.decorators import login_required
from inspirehep.records.api import LiteratureRecord
from inspirehep.records.api.authors import AuthorsRecord
from inspirehep.records.api.literature import import_article
from inspirehep.records.errors import (
    ExistingArticleError,
    ImportArticleError,
    ImportConnectionError,
    ImportParsingError,
    MaxResultWindowRESTError,
    UnknownImportIdentifierError,
)
from inspirehep.records.marshmallow.literature.references import (
    LiteratureReferencesSchema,
)
from inspirehep.records.models import AuthorHighlights
from inspirehep.serializers import jsonify
from inspirehep.submissions.serializers import literature_v1

from ..search.api import LiteratureSearch

LOGGER = structlog.getLogger()
blueprint = Blueprint("inspirehep_records", __name__, url_prefix="")
parser = FlaskParser()


class LiteratureCitationsResource(MethodView):
    view_name = "literature_citations"

    @pass_record
    def get(self, pid, record):
        page = request.values.get("page", 1, type=int)
        size = request.values.get("size", 10, type=int)

        if page < 1 or size < 1:
            abort(400)

        if size > current_app.config["MAX_API_RESULTS"]:
            raise MaxResultWindowRESTError

        citing_records_results = LiteratureSearch.citations(record, page, size)
        citing_records_count = citing_records_results.total["value"]
        citing_records = [citation.to_dict() for citation in citing_records_results]

        data = {
            "metadata": {
                "citations": citing_records,
                "citation_count": citing_records_count,
            }
        }
        return jsonify(data)


class LiteratureReferencesResource(MethodView):
    view_name = "literature_references"

    @pass_record
    def get(self, pid, record):
        page = request.values.get("page", 1, type=int)
        size = request.values.get("size", 25, type=int)

        if page < 1 or size < 1:
            abort(400)

        if size > current_app.config["MAX_API_RESULTS"]:
            raise MaxResultWindowRESTError()

        references = record.get("references", [])
        selected_references = references[(page - 1) * size : page * size]
        data = {
            "metadata": LiteratureReferencesSchema()
            .dump({"references": selected_references})
            .data
        }
        data["metadata"]["references_count"] = len(references)
        return jsonify(data)


@blueprint.route("/literature/import/<path:identifier>", methods=("GET",))
def import_article_view(identifier):
    try:
        article = import_article(identifier)
        return jsonify({"data": literature_v1.dump(article)})

    except ExistingArticleError as e:
        message, recid = e.args
        return jsonify(message=str(message), recid=str(recid)), 409

    except ImportArticleError as e:
        LOGGER.exception("Exception in import_article_view", exception=e)
        return jsonify(message=str(e)), 404

    except ImportConnectionError as e:
        LOGGER.exception("Exception in import_article_view", exception=e)
        return jsonify(message=str(e)), 502

    except ImportParsingError as e:
        LOGGER.exception("Exception in import_article_view", exception=e)
        return jsonify(message=f"The article has an invalid format.\n{e}"), 500

    except UnknownImportIdentifierError:
        return jsonify(message=f"{identifier} is not a recognized identifier."), 400


@blueprint.route("/authors/highlights", methods=["POST"])
@login_required
@parser.use_args(
    {
        "author_recid": fields.Integer(required=True),
        "literature_recids": fields.List(fields.Integer, required=True),
    },
    locations=("json",),
)
def set_author_highlights(args):
    author_recid = args["author_recid"]
    literature_recids = args["literature_recids"]

    try:
        author = AuthorsRecord.get_record_by_pid_value(author_recid)
    except PIDDoesNotExistError:
        LOGGER.error(
            "Cannot highlight. Author record does not exist.",
            literature_recid=author_recid,
        )
        return jsonify({"message": "Internal Error"}), 500

    author_highlights = []
    for recid in literature_recids:
        try:
            record = LiteratureRecord.get_record_by_pid_value(recid)
        except PIDDoesNotExistError:
            LOGGER.warning(
                "Cannot highlight. Literature record does not exist.",
                literature_recid=recid,
            )
            continue

        author_highlights.append(
            AuthorHighlights(author_id=author.id, literature_id=record.id)
        )
    try:
        db.session.bulk_save_objects(author_highlights)
        db.session.commit()
    except Exception as e:
        LOGGER.error(
            "Cannot highlight. DB error.",
            error=e,
        )
        return jsonify({"message": "Internal Error"}), 500

    return jsonify("success"), 200


@blueprint.route("/authors/highlights/<path:author_recid>", methods=("GET",))
def get_author_highlights(author_recid):
    try:
        author = AuthorsRecord.get_record_by_pid_value(author_recid)
    except PIDDoesNotExistError:
        LOGGER.error(
            "Cannot highlight. Author record does not exist.",
            literature_recid=author_recid,
        )
        return jsonify({"message": "Internal Error"}), 500

    highlight_results = (
        db.session.query(RecordMetadata, AuthorHighlights)
        .filter(
            AuthorHighlights.literature_id == RecordMetadata.id,
            AuthorHighlights.author_id == author.id,
        )
        .all()
    )

    highlight_records = [rec[0].json for rec in highlight_results]

    return jsonify({"highlighted_records": highlight_records}), 200


literature_citations_view = LiteratureCitationsResource.as_view(
    LiteratureCitationsResource.view_name
)
literature_references_view = LiteratureReferencesResource.as_view(
    LiteratureReferencesResource.view_name
)
blueprint.add_url_rule(
    '/literature/<inspirepid(lit,record_class="inspirehep.records.api:LiteratureRecord"):pid_value>/citations',
    view_func=literature_citations_view,
)
blueprint.add_url_rule(
    '/literature/<inspirepid(lit,record_class="inspirehep.records.api:LiteratureRecord"):pid_value>/references',
    view_func=literature_references_view,
)
