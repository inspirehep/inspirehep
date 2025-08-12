#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from flask import Blueprint, abort, current_app, request
from flask.views import MethodView
from flask_login import current_user
from inspirehep.accounts.decorators import login_required, login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.records.api.literature import (
    InspireRecord,
    LiteratureRecord,
    import_article,
)
from inspirehep.records.errors import (
    ExistingArticleError,
    ImportArticleNotFoundError,
    ImportParsingError,
    MaxResultWindowRESTError,
    UnknownImportIdentifierError,
)
from inspirehep.records.marshmallow.literature.common import ReferenceItemSchemaV2
from inspirehep.records.marshmallow.literature.references import (
    LiteratureReferencesSchema,
)
from inspirehep.records.models import WorkflowsRecordSources
from inspirehep.records.utils import (
    _create_ticket_self_curation,
    get_changed_reference,
    get_ref_from_pid,
)
from inspirehep.search.api import LiteratureSearch
from inspirehep.serializers import jsonify
from inspirehep.submissions.serializers import literature_v1
from invenio_db import db
from invenio_records_rest.views import pass_record
from requests.exceptions import RequestException
from sqlalchemy.orm.exc import StaleDataError
from webargs import fields
from webargs.flaskparser import FlaskParser

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
            {
                key: val
                for key, val in zip(
                    required_fields_mapping.keys(), result, strict=False
                )
            }
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
                        "message": (
                            f"workflow source for record {record_uuid} and source"
                            f" {source} added"
                        )
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
                message=(
                    "There was an error when importing metadata. Please try again later"
                    " or fill the form manually."
                )
            ),
            502,
        )


@blueprint.route("/literature/reference-self-curation", methods=["POST"])
@login_required
@parser.use_args(
    {
        "record_id": fields.String(required=True),
        "revision_id": fields.Integer(required=True),
        "reference_index": fields.Integer(required=True),
        "new_reference_recid": fields.Integer(required=True),
    },
    locations=("json",),
)
def reference_self_curation(args):
    record_id = args["record_id"]
    reference_index = args["reference_index"]
    revision_id = args["revision_id"]

    record = LiteratureRecord.get_record(record_id)
    if record.revision_id != revision_id:
        return (
            jsonify({"message": "Record version doesn't match the latest version"}),
            422,
        )

    if len(record.get("references", [])) - 1 < reference_index:
        return jsonify({"message": "Reference index doesn't exist"}), 412

    record = InspireRecord.get_record(record_id)
    if record.revision_id > revision_id:
        raise StaleDataError

    updated_reference = get_ref_from_pid("lit", args["new_reference_recid"])
    record["references"][reference_index]["record"] = updated_reference
    record["references"][reference_index]["curated_relation"] = True
    record.update(dict(record))
    db.session.commit()

    _create_ticket_self_curation(
        record_control_number=record["control_number"],
        record_revision_id=record.revision_id,
        user_email=current_user.email,
    )

    return jsonify({"message": "Success"}), 200


@blueprint.route(
    '/literature/<inspirepid(lit,record_class="inspirehep.records.api.literature:LiteratureRecord"):pid_value>/diff/<int:old_revision>..<int:new_revision>'
)
@login_required_with_roles([Roles.superuser.value, Roles.cataloger.value])
def literature_reference_difference_between_versions(
    pid_value, old_revision, new_revision
):
    if new_revision <= old_revision:
        return (
            jsonify({"message": "Old revision must be lower than new revision"}),
            400,
        )
    new_version_id = new_revision + 1
    old_version_id = old_revision + 1
    record_uuid = str(PidStoreBase.get_uuid_for_recid(pid_value.value, "lit"))
    try:
        old_record = InspireRecord.get_record(
            record_uuid, record_version=old_version_id
        )
        new_record = InspireRecord.get_record(
            record_uuid, record_version=new_version_id
        )
    except StaleDataError:
        return jsonify({"message": "Record in given revision was not found"}), 400
    changed_reference = get_changed_reference(old_record, new_record)
    if not changed_reference:
        return jsonify({"message": "Changed reference not found"}), 400

    reference_index = changed_reference.pop("reference_index")
    data = {
        key: ReferenceItemSchemaV2().dumps(value).data
        for key, value in changed_reference.items()
    }
    data["reference_index"] = reference_index
    return jsonify(data), 200


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
    '/literature/<inspirepid(lit,record_class="inspirehep.records.api.literature:LiteratureRecord"):pid_value>/citations',
    view_func=literature_citations_view,
)
blueprint.add_url_rule(
    '/literature/<inspirepid(lit,record_class="inspirehep.records.api.literature:LiteratureRecord"):pid_value>/references',
    view_func=literature_references_view,
)
blueprint.add_url_rule(
    "/literature/workflows_record_sources", view_func=workflows_record_sources_view
)
