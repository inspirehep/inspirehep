import pytest
from include.utils.arxiv import fetch_record_by_id


class TestArxiv:
    @pytest.mark.vcr
    def test_fetch_record_by_id(self):
        arxiv_id = "2511.23462"

        xml_record = fetch_record_by_id(
            "arxiv_oaipmh_connection",
            "arXiv",
            arxiv_id=arxiv_id,
        )

        assert f"oai:arXiv.org:{arxiv_id}" in xml_record
