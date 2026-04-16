import pytest
from include.utils import opensearch
from include.utils.constants import STATUS_APPROVAL_FUZZY_MATCHING, STATUS_COMPLETED


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
