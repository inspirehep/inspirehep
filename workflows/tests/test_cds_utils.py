from include.utils.cds import (
    build_literature_search_params,
    get_record_for_provided_ids,
    has_any_id,
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
