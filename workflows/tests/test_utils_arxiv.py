import pytest
from include.utils.arxiv import fetch_record_by_id

from tests.test_utils import function_test


class TestArxiv:
    @pytest.mark.vcr
    def test_fetch_record_by_id(self):
        arxiv_id = "2511.23462"

        xml_record = function_test(
            fetch_record_by_id,
            params={
                "connection_id": "arxiv_oaipmh_connection",
                "metadata_prefix": "arXiv",
                "arxiv_id": arxiv_id,
            },
        )

        assert f"oai:arXiv.org:{arxiv_id}" in xml_record
