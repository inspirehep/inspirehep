from include.utils.cds import (
    build_literature_search_params,
    get_identifiers_for_scheme,
    get_record_for_provided_ids,
    has_any_id,
    has_any_rdm_id,
    search_and_return_single,
)


class FakeESCallHook:
    def __init__(self, response_payload):
        self._resp = response_payload

    def search_records(self, pid_type, query_params):
        return self._resp


def test_has_any_id_without_additional_ids():
    record = {"id": "2302862", "metadata": {"control_number": "2302862"}}
    assert has_any_id(record) is False


def test_has_any_id_with_any_id_present():
    record = {
        "id": "2635152",
        "metadata": {
            "control_number": "2635152",
            "other_ids": ["1674998"],
            "eprints": ["eprint1"],
            "dois": [{"value": "10.1093/mnras/stx1357"}],
            "report_numbers": [{"value": "RN123"}],
        },
    }
    assert has_any_id(record) is True


def test_get_identifiers_for_scheme_basic():
    identifiers = [
        {"scheme": "inspire", "identifier": "123"},
        {"scheme": "arxiv", "identifier": "arxiv:456"},
        {"scheme": "cds_ref", "identifier": "789"},
    ]
    assert get_identifiers_for_scheme(identifiers, "inspire") == ["123"]
    assert get_identifiers_for_scheme(identifiers, "arxiv") == ["arxiv:456"]
    assert get_identifiers_for_scheme(identifiers, "cds_ref") == ["789"]


def test_has_any_rdm_id_has_id_and_inspire_identifier():
    record = {
        "id": "cds-1",
        "metadata": {
            "identifiers": [
                {"scheme": "inspire", "identifier": "INSPIRE-1"},
            ]
        },
    }
    assert has_any_rdm_id(record) is True


def test_has_any_rdm_id_has_id_and_arxiv_identifier():
    record = {
        "id": "cds-2",
        "metadata": {
            "identifiers": [
                {"scheme": "arxiv", "identifier": "arxiv:1234"},
            ]
        },
    }
    assert has_any_rdm_id(record) is True


def test_has_any_rdm_id_has_id_and_doi():
    record = {
        "id": "cds-3",
        "metadata": {"identifiers": []},
        "pids": {"doi": {"identifier": "10.1234/abc"}},
    }
    assert has_any_rdm_id(record) is True


def test_has_any_rdm_id_has_id_and_parent_doi():
    record = {
        "id": "cds-3",
        "parent": {"pids": {"doi": {"identifier": "10.1234/abc"}}},
        "metadata": {"identifiers": []},
    }
    assert has_any_rdm_id(record) is True


def test_has_any_rdm_id_has_id_doi_and_parent_doi():
    record = {
        "id": "cds-3",
        "parent": {"pids": {"doi": {"identifier": "10.1234/abc"}}},
        "metadata": {"identifiers": []},
        "pids": {"doi": {"identifier": "10.1234/abcd"}},
    }
    assert has_any_rdm_id(record) is True


def test_has_any_rdm_id_has_id_and_cds_ref():
    record = {
        "id": "cds-4",
        "metadata": {
            "identifiers": [
                {"scheme": "cds_ref", "identifier": "CDS-REF-1"},
            ]
        },
    }
    assert has_any_rdm_id(record) is True


def test_has_any_rdm_id_no_cds_id():
    record = {
        "metadata": {
            "identifiers": [
                {"scheme": "inspire", "identifier": "INSPIRE-1"},
            ]
        }
    }
    assert has_any_rdm_id(record) is False


def test_has_any_rdm_id_has_id_no_identifiers():
    record = {"id": "cds-5", "metadata": {"identifiers": []}}
    assert has_any_rdm_id(record) is False


def test_has_any_rdm_id_has_all_no_correct_scheme():
    record = {
        "id": "cds-6",
        "metadata": {
            "identifiers": [
                {"scheme": "other", "identifier": "OTHER-1"},
            ]
        },
    }
    assert has_any_rdm_id(record) is False


def test_build_literature_search_url_multiple_clauses():
    control_numbers = ["123", "456"]
    arxivs = ["1901.1234"]
    dois = ["10.0/xxx"]
    report_numbers = ["arXiv:1706.01046", "RNABC"]
    query = build_literature_search_params(
        control_numbers, arxivs, dois, report_numbers
    )
    expected = (
        "arxiv:1706.01046 OR arxiv:1901.1234 OR control_number:123 "
        "OR control_number:456 OR dois.value:10.0/xxx "
        'OR report_numbers.value.fuzzy:"RNABC"'
    )
    assert query == expected


def test_build_literature_search_url_empty():
    assert build_literature_search_params([], [], [], []) == ""


def test_search_and_return_single_single_hit(tmp_path):
    resp = {"hits": {"hits": [{"metadata": {"control_number": 123}}]}}
    hook = FakeESCallHook(resp)
    result = search_and_return_single(hook, "q=test")
    assert result == 123


def test_search_and_return_single_no_hits():
    hook = FakeESCallHook({"hits": {"hits": []}})
    result = search_and_return_single(hook, "q=test")
    assert result is None


def test_search_and_return_single_multiple_hits():
    hook = FakeESCallHook({"hits": {"hits": [{}, {}]}})
    result = search_and_return_single(hook, "q=test")
    assert result is None


def test_get_record_for_provided_ids_prioritize_literature(monkeypatch):
    monkeypatch.setattr(
        "include.utils.cds.search_and_return_single",
        lambda hook, query: 10,
    )
    recid = get_record_for_provided_ids(
        inspire_http_record_management_hook=None,
        control_numbers=["1"],
        arxivs=[],
        dois=[],
        report_numbers=[],
    )
    assert recid == 10


def test_get_record_for_provided_ids_fallback_to_report(monkeypatch):
    monkeypatch.setattr(
        "include.utils.cds.search_and_return_single",
        lambda hook, query: 20,
    )
    recid = get_record_for_provided_ids(
        inspire_http_record_management_hook=None,
        control_numbers=[],
        arxivs=[],
        dois=[],
        report_numbers=["RN1"],
    )
    assert recid == 20


def test_get_record_for_provided_ids_none(monkeypatch):
    monkeypatch.setattr(
        "include.utils.cds.search_and_return_single",
        lambda hook, query: None,
    )
    recid = get_record_for_provided_ids(
        inspire_http_record_management_hook=None,
        control_numbers=[],
        arxivs=[],
        dois=[],
        report_numbers=[],
    )
    assert recid is None
