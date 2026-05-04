import datetime

import pytest
from include.utils.arxiv import eprint_to_datetime
from include.utils.harvests import fetch_record_oaipmh_by_identifier


@pytest.mark.usefixtures("hep_env")
class TestArxiv:
    @pytest.mark.vcr
    def test_fetch_record_oaipmh_by_identifier(self):
        arxiv_id = "2511.23462"

        xml_record = fetch_record_oaipmh_by_identifier(
            "arxiv_oaipmh_connection", "arXiv", f"oai:arXiv.org:{arxiv_id}"
        )

        assert f"oai:arXiv.org:{arxiv_id}" in xml_record

    def test_eprint_to_datetime(self):
        assert eprint_to_datetime("2605.12345") == datetime.datetime(2026, 5, 1, 0, 0)
        assert eprint_to_datetime("math.NT/9901001") == datetime.datetime(
            1999, 1, 1, 0, 0
        )
