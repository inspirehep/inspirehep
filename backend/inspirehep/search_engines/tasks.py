# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from celery import shared_task
from elasticsearch import (
    ConflictError,
    ConnectionError,
    ConnectionTimeout,
    NotFoundError,
    RequestError,
)
from flask import current_app, render_template
from requests.exceptions import HTTPError

from inspirehep.utils import chunker

from .render import get_rendered_records, upload_rendered_content
from .sitemap import (
    generate_sitemap_items,
    get_sitemap_page_absolute_url,
    upload_sitemap_content,
)

LOGGER = structlog.getLogger()


@shared_task(
    ignore_results=False,
    queue="sitemap",
    acks_late=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(
        ConflictError,
        ConnectionError,
        ConnectionTimeout,
        NotFoundError,
        RequestError,
    ),
)
def create_sitemap():
    page_size = current_app.config["SITEMAP_PAGE_SIZE"]
    sitemap_items = generate_sitemap_items()
    page = 1
    pages = chunker(sitemap_items, page_size)
    for page_items in pages:
        page_content = render_template("sitemap/page.xml", urlset=page_items)
        upload_sitemap_content(page, page_content)
        page += 1

    page_range = range(1, page)
    index_items = [
        {"loc": get_sitemap_page_absolute_url(page_number)}
        for page_number in page_range
    ]
    index_content = render_template("sitemap/index.xml", urlset=index_items)
    upload_sitemap_content("", index_content)


@shared_task(
    ignore_results=False,
    queue="rendertron",
    acks_late=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(
        ConflictError,
        ConnectionError,
        ConnectionTimeout,
        NotFoundError,
        RequestError,
        HTTPError,
    ),
)
def render_records():
    collections = get_rendered_records()
    for collection in collections:
        records = chunker(collection, 1000)
        for idx, records in enumerate(records):
            for control_number, record_html in records:
                upload_rendered_content(record_html, control_number)
