# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from io import BytesIO

import requests
import structlog
from flask import current_app

from inspirehep.files.api import current_s3_instance
from inspirehep.utils import get_inspirehep_url

from .collections import get_indexable_record_searches
from .utils import SEARCH_SOURCE, get_endpoint_from_schema

LOGGER = structlog.getLogger()

RENDERTRON_MIME_TYPE = "text/html"


def get_render_bucket(postfix):
    return f"{current_app.config['S3_RENDERTRON_BUCKET']}{postfix}"


def render_records_from_search(record_search):
    base_url = get_inspirehep_url()
    session = requests.Session()
    session.headers.update({"User-Agent": "googlebot"})
    for record in record_search.params(_source=SEARCH_SOURCE).scan():
        endpoint = get_endpoint_from_schema(record["$schema"])
        try:
            results = session.get(
                f"{base_url}/{endpoint}/{record.control_number}", timeout=120
            )
            results.raise_for_status()
        except Exception:
            LOGGER.exception("Error getting rendered record record.")
            continue
        yield record.control_number, results.content


def get_rendered_records():
    for record_search in get_indexable_record_searches():
        yield render_records_from_search(record_search)


def upload_rendered_content(page_content, control_number):
    control_number = str(control_number)
    bucket = get_render_bucket(control_number[0])
    file_data = BytesIO(page_content)
    filename = f"{control_number}.html"
    current_s3_instance.upload_file(
        file_data,
        filename,
        filename,
        RENDERTRON_MIME_TYPE,
        current_app.config["S3_FILE_ACL"],
        bucket,
    )
