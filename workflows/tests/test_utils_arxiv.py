import pytest
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
