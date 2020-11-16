import json

from helpers.factories.db.invenio_records import TestRecordMetadata
from helpers.utils import create_record, create_user
from invenio_accounts.testutils import login_user_via_session


def test_get_linked_refs(inspire_app):
    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
        "control_number": 1,
        "document_type": ["article"],
        "publication_info": [
            {
                "artid": "045",
                "journal_title": "JHEP",
                "journal_volume": "06",
                "page_start": "045",
                "year": 2007,
            }
        ],
        "titles": [{"title": "The Strongly-Interacting Light Higgs"}],
    }
    create_record("lit", cited_record_json)

    references = {
        "references": [
            {
                "reference": {
                    "publication_info": {
                        "artid": "045",
                        "journal_title": "JHEP",
                        "journal_volume": "06",
                        "page_start": "045",
                        "year": 2007,
                    }
                }
            }
        ]
    }

    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/matcher/linked_references/",
            content_type="application/json",
            data=json.dumps(references),
        )
    assert response.status_code == 200

    linked_refs = json.loads(response.data)
    assert (
        linked_refs["references"][0]["record"]["$ref"]
        == "http://localhost:5000/api/literature/1"
    )


def test_get_linked_refs_empty_list(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/matcher/linked_references/",
            content_type="application/json",
            data=json.dumps({"references": []}),
        )
    assert response.status_code == 200

    linked_refs = json.loads(response.data)
    assert linked_refs["references"] == []


def test_get_linked_refs_references_are_none(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "api/matcher/linked_references/", content_type="application/json", data=None
        )
    assert response.status_code == 400


def test_get_linked_refs_bad_request(inspire_app):
    user = create_user()

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "api/matcher/linked_references/",
        )
    assert response.status_code == 405
