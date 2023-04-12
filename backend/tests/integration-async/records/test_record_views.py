# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
from helpers.providers.faker import faker
from helpers.utils import create_user
from inspire_dojson.utils import get_recid_from_ref
from invenio_accounts.testutils import login_user_via_session
from invenio_db import db
from tenacity import retry, stop_after_delay, wait_fixed

from inspirehep.records.api import InspireRecord
from inspirehep.search.api import InspireSearch


@mock.patch("inspirehep.records.tasks._create_ticket_self_curation")
def test_self_curation_view_happy_flow(
    mock_ticket, inspire_app, override_config, clean_celery_session
):
    with override_config(FEATURE_FLAG_ENABLE_SNOW=True):
        user = create_user()
        literature_data = faker.record("lit")
        literature_data.update(
            {
                "control_number": 1234,
                "references": [
                    {
                        "reference": {
                            "dois": ["10.1103/PhysRev.92.649"],
                            "misc": ["The 7.68MeV state in 12C"],
                            "label": "31",
                            "authors": [
                                {"full_name": "Dunbar, D.N.F."},
                                {"full_name": "Pixley, R.E."},
                                {"full_name": "Wenzel, W.A."},
                                {"full_name": "Whaling, W."},
                            ],
                            "publication_info": {
                                "year": 1953,
                                "page_end": "650",
                                "page_start": "649",
                                "journal_title": "Phys.Rev.",
                                "journal_volume": "92",
                            },
                        }
                    },
                ],
            }
        )

        record = InspireRecord.create(literature_data)
        db.session.commit()

        @retry(stop=stop_after_delay(30), wait=wait_fixed(0.3))
        def assert_record_in_es():
            literature_record_from_es = InspireSearch.get_record_data_from_es(record)
            assert literature_record_from_es

        assert_record_in_es()

        data = {
            "record_id": record.id,
            "revision_id": record.revision_id,
            "reference_index": 0,
            "new_reference_recid": 12,
        }

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=user.email)
            response = client.post(
                "/api/literature/reference-self-curation",
                content_type="application/json",
                data=orjson.dumps(data),
            )

        assert response.status_code == 200

        @retry(stop=stop_after_delay(30), wait=wait_fixed(0.3))
        def assert_reference_self_curation_task():
            literature_record_from_es = InspireSearch.get_record_data_from_es(record)
            assert (
                get_recid_from_ref(literature_record_from_es["references"][0]["record"])
                == 12
            )

        assert_reference_self_curation_task()
