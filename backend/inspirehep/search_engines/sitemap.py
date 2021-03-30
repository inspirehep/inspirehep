# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from io import BytesIO

import structlog
from flask import current_app

from inspirehep.files.api import current_s3_instance
from inspirehep.utils import get_inspirehep_url

from .collections import get_indexable_record_searches
from .utils import SEARCH_SOURCE, get_endpoint_from_schema

SITEMAP_MIME_TYPE = "application/xml"

LOGGER = structlog.getLogger()


def get_sitemap_page_filename(page):
    return f"sitemap{page}.xml"


def get_sitemap_page_absolute_url(page):
    base_url = current_app.config.get("SITEMAP_BASE_PAGE_ABSOLUTE_URL")
    if not base_url:
        base_url = get_inspirehep_url()
    return f"{base_url}/{get_sitemap_page_filename(page)}"


def generate_sitemap_items_from_search(record_search):
    base_url = get_inspirehep_url()

    for record in record_search.params(_source=SEARCH_SOURCE).scan():
        endpoint = get_endpoint_from_schema(record["$schema"])
        yield {
            "loc": f"{base_url}/{endpoint}/{record.control_number}",
            "lastmod": record._updated,
        }


def generate_sitemap_items():
    for record_search in get_indexable_record_searches():
        for sitemap_item in generate_sitemap_items_from_search(record_search):
            yield sitemap_item


def upload_sitemap_content(page, page_content):
    bucket = current_app.config["S3_SITEMAP_BUCKET"]
    file_data = page_content.encode("utf8")
    file_data = BytesIO(file_data)
    filename = get_sitemap_page_filename(page)
    current_s3_instance.upload_file(
        file_data,
        filename,
        filename,
        SITEMAP_MIME_TYPE,
        current_app.config["S3_FILE_ACL"],
        bucket,
    )
