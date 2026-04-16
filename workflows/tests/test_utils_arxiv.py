import pytest
from include.utils.harvests import fetch_record_oaipmh_by_identifier

from tests.test_utils import function_test


class TestArxiv:
    @pytest.mark.vcr
    def test_fetch_record_oaipmh_by_identifier(self):
        arxiv_id = "2511.23462"

        xml_record = function_test(
            fetch_record_oaipmh_by_identifier,
            params={
                "connection_id": "arxiv_oaipmh_connection",
                "metadata_prefix": "arXiv",
                "identifier": f"oai:arXiv.org:{arxiv_id}",
            },
        )

        assert f"oai:arXiv.org:{arxiv_id}" in xml_record
