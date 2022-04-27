from flask import Blueprint, request
from refextract import (
    extract_journal_reference,
    extract_references_from_file,
    extract_references_from_string,
)

from inspirehep.records.utils import download_file_from_url
from inspirehep.serializers import jsonify

from .utils import get_journal_kb_dict

blueprint = Blueprint("inspirehep_refextract", __name__, url_prefix="/refextract")


@blueprint.route("/extract_journal_info", methods=["POST"])
def extract_journal_info():
    publication_infos = request.json["publication_info"]
    extracted_publication_infos = []
    journal_dict = {"journals": get_journal_kb_dict()}
    try:
        for publication_info in publication_infos:
            extracted_publication_info = extract_journal_reference(
                publication_info["pubinfo_freetext"],
                override_kbs_files=journal_dict,
            )
            if not extracted_publication_info:
                extracted_publication_info = {}
            extracted_publication_infos.append(extracted_publication_info)
    except TimeoutError:
        return jsonify({"message": "Can not extract references due to timeout"}), 500
    return jsonify({"extracted_publication_infos": extracted_publication_infos})


@blueprint.route("/extract_references_from_text", methods=["POST"])
def extract_references_from_text():
    text = request.json["text"]
    journal_dict = {"journals": get_journal_kb_dict()}
    try:
        extracted_references = extract_references_from_string(
            text,
            override_kbs_files=journal_dict,
            reference_format=u"{title},{volume},{page}",
        )
    except TimeoutError:
        return jsonify({"message": "Can not extract references due to timeout"}), 500
    return jsonify({"extracted_references": extracted_references})


@blueprint.route("/extract_references_from_url", methods=["POST"])
def extract_references_from_url():
    url = request.json["file_url"]
    journal_dict = {"journals": get_journal_kb_dict()}
    document_data = download_file_from_url(url)
    tmp_file_path = "/tmp/document.pdf"
    with open(tmp_file_path, "wb") as f:
        f.write(document_data)
    try:
        extracted_references = extract_references_from_file(
            tmp_file_path,
            override_kbs_files=journal_dict,
            reference_format=u"{title},{volume},{page}",
        )
    except TimeoutError:
        return jsonify({"message": "Can not extract references due to timeout"}), 500
    return jsonify({"extracted_references": extracted_references})
