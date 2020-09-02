# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from time import sleep

from helpers.providers.faker import faker
from inspire_dojson.api import record2marcxml
from invenio_db import db
from invenio_oaiserver.models import OAISet

from inspirehep.records.api import LiteratureRecord


def test_oai_with_for_cds_set(
    inspire_app, celery_app_with_context, celery_session_worker
):
    data = {"_export_to": {"CDS": True}}
    record_data = faker.record("lit", data)
    record = LiteratureRecord.create(record_data)
    record_marcxml = record2marcxml(record)
    db.session.commit()

    set_name = inspire_app.config["OAI_SET_CDS"]
    oaiset = OAISet(spec=f"{set_name}", name="Test", description="Test")
    db.session.add(oaiset)
    db.session.commit()

    sleep(2)

    with inspire_app.test_client() as client:
        response = client.get(
            f"/api/oai2d?verb=ListRecords&metadataPrefix=marcxml&set={set_name}"
        )
        assert record_marcxml in response.data


def test_oai_with_for_arxiv_set(
    inspire_app, celery_app_with_context, celery_session_worker
):
    data = {
        "arxiv_eprints": [{"value": "2009.01484"}],
        "report_numbers": [{"value": "CERN-TH-2020-136"}],
    }

    record_data = faker.record("lit", data)
    record = LiteratureRecord.create(record_data)
    record_marcxml = record2marcxml(record)
    db.session.commit()

    set_name = inspire_app.config["OAI_SET_CERN_ARXIV"]
    oaiset = OAISet(spec=f"{set_name}", name="Test", description="Test")
    db.session.add(oaiset)
    db.session.commit()

    sleep(2)

    with inspire_app.test_client() as client:
        response = client.get(
            f"/api/oai2d?verb=ListRecords&metadataPrefix=marcxml&set={set_name}"
        )
        assert record_marcxml in response.data
