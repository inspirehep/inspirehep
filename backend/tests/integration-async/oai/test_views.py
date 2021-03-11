# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker
from helpers.utils import es_search, retry_until_pass
from inspire_dojson.api import record2marcxml
from inspire_utils.record import get_value
from invenio_db import db
from invenio_oaiserver.models import OAISet
from invenio_search import current_search

from inspirehep.records.api import LiteratureRecord


def test_oai_with_for_cds_set(inspire_app, clean_celery_session):
    data = {"_export_to": {"CDS": True}}
    record_data = faker.record("lit", data)
    record = LiteratureRecord.create(record_data)
    record_uuid = record.id
    record_marcxml = record2marcxml(record)
    db.session.commit()

    def assert_the_record_is_indexed():
        current_search.flush_and_refresh("*")
        result = es_search("records-hep")
        uuids = get_value(result, "hits.hits._id")
        assert str(record_uuid) in uuids

    retry_until_pass(assert_the_record_is_indexed)

    set_name = inspire_app.config["OAI_SET_CDS"]
    oaiset = OAISet(spec=f"{set_name}", name="Test", description="Test")
    db.session.add(oaiset)
    db.session.commit()

    with inspire_app.test_client() as client:
        response = client.get(
            f"/api/oai2d?verb=ListRecords&metadataPrefix=marcxml&set={set_name}"
        )
        assert record_marcxml in response.data


def test_oai_with_for_arxiv_set(inspire_app, clean_celery_session):
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "report_numbers": [{"value": "CERN-TH-2020-136"}],
    }

    record_data = faker.record("lit", data)
    record = LiteratureRecord.create(record_data)
    record_uuid = record.id
    record_marcxml = record2marcxml(record)
    db.session.commit()

    def assert_the_record_is_indexed():
        current_search.flush_and_refresh("*")
        result = es_search("records-hep")
        uuids = get_value(result, "hits.hits._id")
        assert str(record_uuid) in uuids

    retry_until_pass(assert_the_record_is_indexed)

    set_name = inspire_app.config["OAI_SET_CERN_ARXIV"]
    oaiset = OAISet(spec=f"{set_name}", name="Test", description="Test")
    db.session.add(oaiset)
    db.session.commit()
    with inspire_app.test_client() as client:
        response = client.get(
            f"/api/oai2d?verb=ListRecords&metadataPrefix=marcxml&set={set_name}"
        )
        assert record_marcxml in response.data


def test_oai_get_single_identifier_for_CDS_set(inspire_app, clean_celery_session):
    data = {"_export_to": {"CDS": True}}
    record_data = faker.record("lit", data)
    record = LiteratureRecord.create(record_data)
    record_uuid = record.id
    record_marcxml = record2marcxml(record)
    db.session.commit()

    def assert_the_record_is_indexed():
        current_search.flush_and_refresh("*")
        result = es_search("records-hep")
        uuids = get_value(result, "hits.hits._id")
        assert str(record_uuid) in uuids

    retry_until_pass(assert_the_record_is_indexed)

    set_name = inspire_app.config["OAI_SET_CDS"]
    oaiset = OAISet(spec=f"{set_name}", name="Test", description="Test")
    db.session.add(oaiset)
    db.session.commit()

    with inspire_app.test_client() as client:
        response = client.get(
            f"/api/oai2d?verb=GetRecord&metadataPrefix=marcxml&identifier=oai:inspirehep.net:{record['control_number']}"
        )
        assert record_marcxml in response.data


def test_oai_get_single_identifier_for_arxiv_set(inspire_app, clean_celery_session):
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "report_numbers": [{"value": "CERN-TH-2020-136"}],
    }

    record_data = faker.record("lit", data)
    record = LiteratureRecord.create(record_data)
    record_uuid = record.id
    record_marcxml = record2marcxml(record)
    db.session.commit()

    def assert_the_record_is_indexed():
        current_search.flush_and_refresh("*")
        result = es_search("records-hep")
        uuids = get_value(result, "hits.hits._id")
        assert str(record_uuid) in uuids

    retry_until_pass(assert_the_record_is_indexed)

    set_name = inspire_app.config["OAI_SET_CERN_ARXIV"]
    oaiset = OAISet(spec=f"{set_name}", name="Test", description="Test")
    db.session.add(oaiset)
    db.session.commit()

    with inspire_app.test_client() as client:
        response = client.get(
            f"/api/oai2d?verb=GetRecord&metadataPrefix=marcxml&identifier=oai:inspirehep.net:{record['control_number']}"
        )
        assert record_marcxml in response.data
