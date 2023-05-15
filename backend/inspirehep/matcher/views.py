from flask import Blueprint, request
from webargs import fields
from webargs.flaskparser import FlaskParser

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.matcher.api import (
    exact_match_literature_data,
    fuzzy_match_literature_data,
    match_references,
)
from inspirehep.serializers import jsonify

blueprint = Blueprint("inspirehep_matcher", __name__, url_prefix="/matcher")
parser = FlaskParser()


@blueprint.route("/linked_references", methods=["POST"])
def get_linked_refs():
    data = request.json
    match_result = match_references(data["references"])
    return jsonify({"references": match_result.get("matched_references")})


@blueprint.route("/exact-match", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
@parser.use_args(
    {
        "data": fields.Dict(required=True),
    },
    locations=("json",),
)
def exact_match(args):
    match_result = exact_match_literature_data(args["data"])
    return jsonify({"matched_ids": match_result})


@blueprint.route("/fuzzy-match", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
@parser.use_args(
    {
        "data": fields.Dict(required=True),
    },
    locations=("json",),
)
def fuzzy_match(args):
    match_result = fuzzy_match_literature_data(args["data"])
    return jsonify({"matched_data": match_result})
