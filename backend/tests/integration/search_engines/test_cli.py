# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from io import BytesIO

import pytest
from flask import render_template
from helpers.utils import create_record, es_search
from inspire_utils.record import get_value
from lxml import etree

from inspirehep.files import current_s3_instance
from inspirehep.search_engines.cli import BUCKETS
from inspirehep.utils import get_inspirehep_url


def validate_xml_syntax(xml):
    etree.parse(BytesIO(xml.encode()))


def test_generate_multiple_sitemap_files_with_multiple_collection(
    s3, inspire_app, cli, override_config
):
    current_s3_instance.client.create_bucket(
        Bucket=inspire_app.config["S3_SITEMAP_BUCKET"]
    )
    create_record("lit")
    create_record("con")
    create_record("job", data={"status": "open"})
    create_record("job", data={"status": "closed"})  # excluded
    create_record("job", data={"status": "pending"})  # excluded
    create_record("aut")
    create_record("sem")
    create_record("exp")
    create_record("ins")

    config = {"SITEMAP_PAGE_SIZE": 1}
    with override_config(**config):
        result = cli.invoke(["sitemap", "generate"])
    assert result.exit_code == 0

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap.xml", obj)
    obj.seek(0)
    validate_xml_syntax(obj.read().decode("utf8"))

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap1.xml", obj)
    obj.seek(0)
    validate_xml_syntax(obj.read().decode("utf8"))

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap2.xml", obj)
    obj.seek(0)
    validate_xml_syntax(obj.read().decode("utf8"))

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap3.xml", obj)
    obj.seek(0)
    validate_xml_syntax(obj.read().decode("utf8"))

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap4.xml", obj)
    obj.seek(0)
    validate_xml_syntax(obj.read().decode("utf8"))

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap5.xml", obj)
    obj.seek(0)
    validate_xml_syntax(obj.read().decode("utf8"))

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap6.xml", obj)
    obj.seek(0)
    validate_xml_syntax(obj.read().decode("utf8"))

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap7.xml", obj)
    obj.seek(0)
    validate_xml_syntax(obj.read().decode("utf8"))


def test_generate_sitemap_file(inspire_app, s3, cli, override_config):
    current_s3_instance.client.create_bucket(
        Bucket=inspire_app.config["S3_SITEMAP_BUCKET"]
    )
    literature = create_record("lit")

    result = es_search("records-hep")
    literature_from_es = get_value(result, "hits.hits._source[0]")

    literature_recid = literature["control_number"]
    literature_updated = literature_from_es["_updated"]

    config = {"SITEMAP_PAGE_SIZE": 1}
    with override_config(**config):
        result = cli.invoke(["sitemap", "generate"])
        assert result.exit_code == 0

    base_url = get_inspirehep_url()

    index_content = render_template(
        "sitemap/index.xml", urlset=[{"loc": f"{base_url}/sitemap1.xml"}]
    )
    validate_xml_syntax(index_content)

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap.xml", obj)
    obj.seek(0)

    assert index_content == obj.read().decode("utf8")

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

    obj = BytesIO()
    current_s3_instance.client.download_fileobj("sitemap", "sitemap1.xml", obj)
    obj.seek(0)

    assert page_content == obj.read().decode("utf8")


@pytest.mark.vcr()
def test_rendertron(inspire_app, s3, cli, override_config):
    bucket_literature_1 = f'{inspire_app.config["S3_RENDERTRON_BUCKET"]}2'
    bucket_literature_2 = f'{inspire_app.config["S3_RENDERTRON_BUCKET"]}1'

    current_s3_instance.client.create_bucket(Bucket=bucket_literature_1)
    current_s3_instance.client.create_bucket(Bucket=bucket_literature_2)

    literature_1 = create_record("lit", data={"control_number": 20})
    literature_2 = create_record("lit", data={"control_number": 1})

    es_search("records-hep")

    config = {"PREFERRED_URL_SCHEME": "https", "SERVER_NAME": "inspirehep.net"}
    with override_config(**config):
        result = cli.invoke(["render", "generate"])
        assert result.exit_code == 0

    obj = BytesIO()
    current_s3_instance.client.download_fileobj(
        bucket_literature_1, f"{literature_1.control_number}.html", obj
    )
    obj.seek(0)
    expected_title = '<span class="__Latex__">IRRADIATION OF A CERIUM - CONTAINING SILICATE GLASS</span>'
    assert expected_title in obj.read().decode("utf8")

    obj = BytesIO()
    current_s3_instance.client.download_fileobj(
        bucket_literature_2, f"{literature_2.control_number}.html", obj
    )
    obj.seek(0)

    expected_title = '<span class="__Latex__">Isoclinic N planes in Euclidean 2N space, Clifford parallels in elliptic (2N-1) space, and the Hurwitz matrix equations</span>'
    assert expected_title in obj.read().decode("utf8")


def test_create_buckets(inspire_app, s3, cli, override_config):
    config = {"S3_FILE_ACL": "public-read", "S3_RENDERTRON_BUCKET": "test-"}
    with override_config(**config):
        result = cli.invoke(["render", "create_buckets"])

        assert result.exit_code == 0
        for bucket in BUCKETS:
            # asserts if bucket is created
            # throws NoSuchBucket, therefore fails the tests
            current_s3_instance.client.get_bucket_acl(Bucket=f"test-{bucket}")
