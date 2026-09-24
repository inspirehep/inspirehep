from unittest.mock import patch

import pytest
from include.utils import opensearch
from include.utils.constants import (
    COMPLETED_STATUSES,
    STATUS_APPROVAL_FUZZY_MATCHING,
    STATUS_COMPLETED,
)


@pytest.mark.usefixtures("hep_env")
class TestUtilsOpenSearch:
    @pytest.mark.vcr
    def test_find_matching_workflows(self):
        workflow_data = {
            "id": "7b617859-cb4f-4526-aa85-ec5291dc141b",
            "data": {
                "arxiv_eprints": [{"value": "2502.05665"}, {"value": "2504.01123"}],
                "dois": [{"value": "10.1103/fc8j-tb8k"}],
            },
        }
        statuses = [STATUS_APPROVAL_FUZZY_MATCHING, STATUS_COMPLETED]

        matches = opensearch.find_matching_workflows(workflow_data, statuses)

        assert len(matches) == 2

    @patch("include.utils.opensearch.CustomOpenSearchHook.search")
    def test_find_completed_workflows_past_retention(self, mock_search):
        mock_search.return_value = {
            "hits": {
                "hits": [
                    {"_source": {"id": "workflow-1"}, "sort": [1]},
                    {"_source": {"id": "workflow-2"}, "sort": [2]},
                ]
            }
        }

        workflow_ids = opensearch.find_completed_workflows_past_retention(
            retention_days=14
        )

        assert workflow_ids == ["workflow-1", "workflow-2"]

        _, call_kwargs = mock_search.call_args
        query = call_kwargs["query"]
        query_filter = query["query"]["bool"]["filter"]
        assert {"terms": {"status": COMPLETED_STATUSES}} in query_filter
        assert {"range": {"_updated_at": {"lte": "now-14d"}}} in query_filter
        assert query["size"] == opensearch.RETENTION_SEARCH_PAGE_SIZE
        assert query["_source"] == ["id"]

    @patch("include.utils.opensearch.CustomOpenSearchHook.search")
    def test_find_completed_workflows_past_retention_paginates(self, mock_search):
        first_page = {
            "hits": {
                "hits": [
                    {"_source": {"id": f"workflow-{i}"}, "sort": [i]}
                    for i in range(opensearch.RETENTION_SEARCH_PAGE_SIZE)
                ]
            }
        }
        second_page = {
            "hits": {
                "hits": [
                    {
                        "_source": {"id": "workflow-last"},
                        "sort": [opensearch.RETENTION_SEARCH_PAGE_SIZE],
                    }
                ]
            }
        }
        mock_search.side_effect = [first_page, second_page]

        workflow_ids = opensearch.find_completed_workflows_past_retention(
            retention_days=14
        )

        assert len(workflow_ids) == opensearch.RETENTION_SEARCH_PAGE_SIZE + 1
        assert workflow_ids[-1] == "workflow-last"
        assert mock_search.call_count == 2

        second_call_kwargs = mock_search.call_args_list[1].kwargs
        assert second_call_kwargs["query"]["search_after"] == [
            opensearch.RETENTION_SEARCH_PAGE_SIZE - 1
        ]
