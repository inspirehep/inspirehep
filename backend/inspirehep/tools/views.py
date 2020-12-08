# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from io import BytesIO, TextIOWrapper
from os.path import splitext

from flask import Blueprint, current_app, request

from inspirehep.files.api import current_s3_instance
from inspirehep.serializers import jsonify
from inspirehep.tools.utils import (
    find_references,
    get_filename,
    get_mimetype,
    get_references,
)
from inspirehep.utils import hash_data

from .errors import FileFormatNotSupportedError, FileTooBigError, NoReferencesFoundError

blueprint = Blueprint("inspirehep_tools", __name__, url_prefix="")

ALLOWED_EXTENSIONS = {".tex"}


def allowed_file(filename):
    _, extension = splitext(filename)
    return extension in ALLOWED_EXTENSIONS


@blueprint.route("/bibliography-generator", methods=["POST"])
def generate_bibliography():
    content_length = request.content_length
    if content_length is not None and content_length > 10 * 1024 * 1024:
        raise FileTooBigError

    requested_format = request.args.get("format")
    bytes_file = request.files["file"]

    if not allowed_file(bytes_file.filename):
        raise FileFormatNotSupportedError

    text_file = TextIOWrapper(bytes_file, errors="ignore")

    reference_names = get_references(text_file)
    references, errors = find_references(reference_names, requested_format)

    if not references:
        raise NoReferencesFoundError

    file_data = "\n\n".join(references).encode("utf-8")
    key = hash_data(file_data)
    file_data = BytesIO(file_data)
    filename = get_filename(bytes_file.filename, requested_format)
    mime_type = get_mimetype(requested_format)
    bucket = current_app.config.get("S3_BIBLIOGRAPHY_GENERATOR_BUCKET")

    current_s3_instance.upload_file(
        file_data, key, filename, mime_type, current_app.config["S3_FILE_ACL"], bucket
    )
    download_url = current_s3_instance.get_s3_url(key, bucket)

    formatted_errors = []
    for error in errors:
        if error["type"] == "ambiguous":
            formatted_errors.append(
                {
                    "message": f"Ambiguous reference to {error['ref']} on line {error['line']}"
                }
            )
        else:
            formatted_errors.append(
                {
                    "message": f"Reference to {error['ref']} not found on line {error['line']}"
                }
            )

    response = {"data": {"download_url": download_url}, "errors": formatted_errors}

    return jsonify(response)
