# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

import click
from flask import current_app, render_template
from flask.cli import with_appcontext

from inspirehep.utils import chunker, get_inspirehep_url

from .sitemap import generate_sitemap_items


@click.group()
def sitemap():
    """Command group to handle sitemap operations."""


def get_sitemap_page_filename(page):
    return f"sitemap{page}.xml"


def get_sitemap_page_absolute_url(page):
    base_url = get_inspirehep_url()
    return f"{base_url}/{get_sitemap_page_filename(page)}"


def write_sitemap_page_content(page, page_content):
    sitemap_path = current_app.config["SITEMAP_FILES_PATH"]
    file_path = os.path.join(sitemap_path, get_sitemap_page_filename(page))
    with open(file_path, "w+") as file:
        file.write(page_content)


@sitemap.command(
    help="Generates sitemaps for records that should be indexed by search engines"
)
@with_appcontext
def generate():
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
