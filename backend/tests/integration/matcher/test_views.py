import orjson
from helpers.utils import create_record, create_user
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


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
            data=orjson.dumps(references),
        )
    assert response.status_code == 200

    linked_refs = orjson.loads(response.data)
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
            data=orjson.dumps({"references": []}),
        )
    assert response.status_code == 200

    linked_refs = orjson.loads(response.data)
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
        response = client.get("api/matcher/linked_references/")
    assert response.status_code == 405


def test_exact_match(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record_data = {
        "control_number": 4328,
        "abstracts": [
            {
                "value": "abstract nb 1",
                "source": "arXiv",
            },
        ],
        "arxiv_eprints": [
            {"value": "2301.08708", "categories": ["gr-qc", "math-ph", "math.MP"]}
        ],
        "titles": [
            {"title": "title nb 1"},
        ],
    }
    record = create_record("lit", record_data)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "api/matcher/exact-match/", data=orjson.dumps({"data": record_data})
        )
    assert response.status_code == 200
    assert record["control_number"] in response.json["matched_ids"]


def test_exact_match_returns_403_for_non_authenticated(inspire_app):
    user = create_user()
    record_data = {
        "control_number": 4328,
        "abstracts": [
            {
                "value": "abstract nb 1",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title nb 1"},
        ],
    }
    create_record("lit", record_data)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "api/matcher/exact-match/", data=orjson.dumps({"data": record_data})
        )
    assert response.status_code == 403


def test_fuzzy_match(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record_data = {
        "control_number": 4328,
        "abstracts": [
            {
                "value": "abstract nb 1",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title nb 1"},
        ],
    }
    record = create_record("lit", record_data)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "api/matcher/fuzzy-match/", data=orjson.dumps({"data": record_data})
        )
    assert response.status_code == 200
    assert (
        record["control_number"] == response.json["matched_data"][0]["control_number"]
    )


def test_fuzzy_match_returns_403_for_non_autheorized_users(inspire_app):
    user = create_user()
    record_data = {
        "control_number": 4328,
        "abstracts": [
            {
                "value": "abstract nb 1",
                "source": "arXiv",
            },
        ],
        "titles": [
            {"title": "title nb 1"},
        ],
    }
    create_record("lit", record_data)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "api/matcher/fuzzy-match/", data=orjson.dumps({"data": record_data})
        )
    assert response.status_code == 403
