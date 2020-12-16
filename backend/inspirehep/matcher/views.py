from flask import Blueprint, request

from inspirehep.matcher.api import match_references
from inspirehep.serializers import jsonify

blueprint = Blueprint("inspirehep_matcher", __name__, url_prefix="/matcher")


@blueprint.route("/linked_references", methods=["POST"])
def get_linked_refs():
    data = request.json
    match_result = match_references(data["references"])
    return jsonify({"references": match_result.get("matched_references")})
