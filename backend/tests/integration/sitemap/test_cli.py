# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from io import BytesIO

from flask import render_template
from helpers.utils import create_record, override_config
from invenio_search import current_search
from lxml import etree
from mock import mock_open, patch

from inspirehep.utils import get_inspirehep_url


def validate_xml_syntax(xml):
    etree.parse(BytesIO(xml.encode()))


@patch("inspirehep.sitemap.cli.open", new_callable=mock_open)
def test_generate_multiple_sitemap_files_with_multiple_collection(
    mocked_open, inspire_app, cli
):
    create_record("lit")
    create_record("con")
    create_record("job", data={"status": "open"})
    create_record("job", data={"status": "closed"})  # excluded
    create_record("job", data={"status": "pending"})  # excluded
    create_record("aut")
    create_record("sem")
    create_record("exp")  # excluded

    config = {"SITEMAP_FILES_PATH": "/tmp", "SITEMAP_PAGE_SIZE": 1}
    with override_config(**config):
        result = cli.invoke(["sitemap", "generate"])

        assert result.exit_code == 0

        mocked_open.assert_any_call("/tmp/sitemap1.xml", "w+")
        mocked_open.assert_any_call("/tmp/sitemap2.xml", "w+")
        mocked_open.assert_any_call("/tmp/sitemap3.xml", "w+")
        mocked_open.assert_any_call("/tmp/sitemap4.xml", "w+")
        mocked_open.assert_any_call("/tmp/sitemap5.xml", "w+")
        mocked_open.assert_any_call("/tmp/sitemap.xml", "w+")

        # make sure no more file is added for experiment and not open jobs
        assert mocked_open.call_count == 6


@patch("inspirehep.sitemap.cli.open", new_callable=mock_open)
def test_generate_sitemap_file(mocked_open, inspire_app, cli):
    literature = create_record("lit")
    literature_from_es = current_search.client.get("records-hep", literature.id)[
        "_source"
    ]
    literature_recid = literature["control_number"]
    literature_updated = literature_from_es["_updated"]

    config = {"SITEMAP_FILES_PATH": "/tmp", "SITEMAP_PAGE_SIZE": 1}
    with override_config(**config):
        result = cli.invoke(["sitemap", "generate"])

        assert result.exit_code == 0

        mocked_open.assert_any_call("/tmp/sitemap1.xml", "w+")
        mocked_open.assert_any_call("/tmp/sitemap.xml", "w+")

        mock_file = mocked_open()
        base_url = get_inspirehep_url()

        index_content = render_template(
            "sitemap/index.xml", urlset=[{"loc": f"{base_url}/sitemap1.xml"}]
        )
        validate_xml_syntax(index_content)
        mock_file.write.assert_any_call(index_content)

        page_content = render_template(
            "sitemap/page.xml",
            urlset=[
                {
                    "loc": f"{base_url}/literature/{literature_recid}",
                    "lastmod": literature_updated,
                }
            ],
        )
        validate_xml_syntax(page_content)
        mock_file.write.assert_any_call(page_content)
