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
from invenio_records_rest.views import pass_record
from requests.exceptions import RequestException
from webargs import fields
from webargs.flaskparser import FlaskParser

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.records.api.literature import import_article
from inspirehep.records.errors import (
    ExistingArticleError,
    ImportArticleNotFoundError,
    ImportParsingError,
    MaxResultWindowRESTError,
    UnknownImportIdentifierError,
)
from inspirehep.records.marshmallow.literature.references import (
    LiteratureReferencesSchema,
)
from inspirehep.records.models import WorkflowsRecordSources
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


class WorkflowsRecordSourcesResource(MethodView):

    view_name = "workflows_record_sources"
    decorators = [
        login_required_with_roles([Roles.superuser.value, Roles.cataloger.value])
    ]

    @parser.error_handler
    def handle_error(error, req, schema, error_status_code, error_headers):
        message = f"Incorrect input for fields: {''.join(error.field_names)}"
        abort(400, message)

    @parser.use_args(
        {"record_uuid": fields.String(required=True), "source": fields.String()}
    )
    def get(self, args):
        record_uuid = args["record_uuid"]
        required_fields_mapping = {
            "created": WorkflowsRecordSources.created,
            "json": WorkflowsRecordSources.json,
            "record_uuid": WorkflowsRecordSources.record_uuid,
            "source": WorkflowsRecordSources.source,
            "updated": WorkflowsRecordSources.updated,
        }
        query = WorkflowsRecordSources.query.with_entities(
            *required_fields_mapping.values()
        ).filter_by(record_uuid=str(record_uuid))
        source = args.get("source")
        if source:
            query = query.filter_by(source=source.lower())
        results = query.all()
        if not results:
            return jsonify({"message": "Workflow source not found"}), 404
        results_data = [
            {key: val for key, val in zip(required_fields_mapping.keys(), result)}
            for result in results
        ]
        return jsonify({"workflow_sources": results_data}), 200

    @parser.use_args(
        {
            "record_uuid": fields.String(required=True),
            "source": fields.String(required=True),
            "json": fields.Dict(required=True),
        }
    )
    def post(self, args):
        record_uuid = args["record_uuid"]
        source = args["source"]
        root_json = args["json"]
        root = WorkflowsRecordSources(
            source=source, record_uuid=record_uuid, json=root_json
        )
        db.session.merge(root)
        db.session.commit()
        if root:
            return (
                jsonify(
                    {
                        "message": f"workflow source for record {record_uuid} and source {source} added"
                    }
                ),
                200,
            )

    @parser.use_args(
        {
            "record_uuid": fields.String(required=True),
            "source": fields.String(required=True),
        }
    )
    def delete(self, args):
        record_uuid = args.get("record_uuid")
        source = args.get("source")
        result = WorkflowsRecordSources.query.filter_by(
            record_uuid=str(record_uuid), source=source.lower()
        ).one_or_none()
        if not result:
            return (
                jsonify(
                    {"message": "No record found for given record_uuid and source!"}
                ),
                404,
            )
        db.session.delete(result)
        db.session.commit()
        return jsonify({"message": "Record succesfully deleted"}), 200


@blueprint.route("/literature/import/<path:identifier>", methods=("GET",))
def import_article_view(identifier):
    try:
        article = import_article(identifier)
        return jsonify({"data": literature_v1.dump(article)})

    except ExistingArticleError as e:
        message, recid = e.args
        return jsonify(message=str(message), recid=str(recid)), 409

    except ImportArticleNotFoundError as e:
        LOGGER.exception("Exception in import_article_view", exception=e)
        return jsonify(message=str(e)), 404

    except ImportParsingError as e:
        LOGGER.exception("Exception in import_article_view", exception=e)
        return jsonify(message="The article has an invalid format."), 500

    except UnknownImportIdentifierError:
        return jsonify(message=f"{identifier} is not a recognized identifier."), 400

    except RequestException as e:
        LOGGER.exception("Exception in import_article_view", exception=e)
        return (
            jsonify(
                message="There was an error when importing metadata. Please try again later or fill the form manually."
            ),
            502,
        )


literature_citations_view = LiteratureCitationsResource.as_view(
    LiteratureCitationsResource.view_name
)
literature_references_view = LiteratureReferencesResource.as_view(
    LiteratureReferencesResource.view_name
)
workflows_record_sources_view = WorkflowsRecordSourcesResource.as_view(
    WorkflowsRecordSourcesResource.view_name
)
blueprint.add_url_rule(
    '/literature/<inspirepid(lit,record_class="inspirehep.records.api:LiteratureRecord"):pid_value>/citations',
    view_func=literature_citations_view,
)
blueprint.add_url_rule(
    '/literature/<inspirepid(lit,record_class="inspirehep.records.api:LiteratureRecord"):pid_value>/references',
    view_func=literature_references_view,
)
blueprint.add_url_rule(
    "/literature/workflows_record_sources", view_func=workflows_record_sources_view
)
