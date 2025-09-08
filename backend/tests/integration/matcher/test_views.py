import orjson
from helpers.utils import create_record, create_user
from inspirehep.accounts.roles import Roles
from invenio_accounts.testutils import login_user_via_session


def test_get_linked_refs(inspire_app):
    cited_record_json = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "_collections": ["Literature"],
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
    record = create_record("lit", cited_record_json)

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
        == f"http://localhost:5000/api/literature/{record['control_number']}"
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


def test_get_journal_kb_data(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    data = {
        "journal_title": {"title": "Journal of Physical Science and Application"},
        "short_title": "J.Phys.Sci.Appl.",
        "title_variants": ["PHYS SCI APPL"],
    }
    create_record("jou", data=data)
    expected = {
        "J PHYS SCI APPL": "J.Phys.Sci.Appl.",
        "JOURNAL OF PHYSICAL SCIENCE AND APPLICATION": "J.Phys.Sci.Appl.",
        "PHYS SCI APPL": "J.Phys.Sci.Appl.",
    }

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/matcher/journal-kb/")
    assert response.status_code == 200
    assert expected == response.json["journal_kb_data"]


def test_get_journal_kb_data_returns_403_for_non_authenticated(inspire_app):
    user = create_user()
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get("api/matcher/journal-kb/")
    assert response.status_code == 403


def test_exact_match(inspire_app):
    user = create_user(role=Roles.cataloger.value)
    record_data = {
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
            "api/matcher/exact-match/",
            data=orjson.dumps({"data": record_data}),
            headers={"Content-Type": "application/json"},
        )
    assert response.status_code == 200
    assert record["control_number"] in response.json["matched_ids"]


def test_exact_match_returns_403_for_non_authenticated(inspire_app):
    user = create_user()
    record_data = {
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
        "titles": [
            {
                "title": (
                    "Search for the limits on anomalous neutral triple gauge couplings"
                    " via ZZ production in the $\\ell\\ell\\nu\\nu$ channel at FCC-hh"
                ),
            }
        ],
        "authors": [
            {"full_name": "Yilmaz, Ali"},
        ],
        "abstracts": [
            {
                "value": (
                    "This paper presents the projections on the anomalous neutral"
                    " triple gauge couplings via production in the 2ℓ2ν final state at"
                    " a 100 TeV proton-proton collider, FCC-hh. The realistic FCC-hh"
                    " detector environments and its effects taken into account in the"
                    " analysis. The study is carried out in the mode where one Z boson"
                    " decays into a pair of same-flavor, opposite-sign leptons"
                    " (electrons or muons) and the other one decays to the two"
                    " neutrinos. The new bounds on the charge-parity (CP)-conserving"
                    " couplings and CP-violating couplings and achieved at 95%"
                    " Confidence Level (C.L.) using the transverse momentum of the"
                    " dilepton system, respectively."
                ),
                "source": "Elsevier B.V.",
            }
        ],
    }
    record = create_record("lit", record_data)

    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.get(
            "api/matcher/fuzzy-match/",
            data=orjson.dumps({"data": record_data}),
            headers={"Content-Type": "application/json"},
        )
    assert response.status_code == 200
    assert (
        record["control_number"] == response.json["matched_data"][0]["control_number"]
    )


def test_fuzzy_match_returns_403_for_non_autheorized_users(inspire_app):
    user = create_user()
    record_data = {
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
