# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from io import BytesIO

from flask import current_app

from inspirehep.files.api import current_s3_instance
from inspirehep.utils import get_inspirehep_url

SITEMAP_MIME_TYPE = "application/xml"


def get_sitemap_page_filename(page):
    return f"sitemap{page}.xml"


def get_sitemap_page_absolute_url(page):
    base_url = current_app.config.get("SITEMAP_BASE_PAGE_ABSOLUTE_URL")
    if not base_url:
        base_url = get_inspirehep_url()
    return f"{base_url}/{get_sitemap_page_filename(page)}"


def write_sitemap_page_content(page, page_content):
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
