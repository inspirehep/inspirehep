#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from celery import shared_task
from flask import current_app, render_template

from inspirehep.errors import ES_TASK_EXCEPTIONS
from inspirehep.sitemap.sitemap import generate_sitemap_items
from inspirehep.sitemap.utils import (
    get_sitemap_page_absolute_url,
    write_sitemap_page_content,
)
from inspirehep.utils import chunker

LOGGER = structlog.getLogger()


@shared_task(
    ignore_results=False,
    queue="sitemap",
    acks_late=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=ES_TASK_EXCEPTIONS,
)
def create_sitemap():
    page_size = current_app.config["SITEMAP_PAGE_SIZE"]
    sitemap_items = generate_sitemap_items()
    page = 1
    pages = chunker(sitemap_items, page_size)
    for page_items in pages:
        page_content = render_template("sitemap/page.xml", urlset=page_items)
        write_sitemap_page_content(page, page_content)
        page += 1

    page_range = range(1, page)
    index_items = [
        {"loc": get_sitemap_page_absolute_url(page_number)}
        for page_number in page_range
    ]
    index_content = render_template("sitemap/index.xml", urlset=index_items)
    write_sitemap_page_content("", index_content)
