import pytest
from include.utils import opensearch
from include.utils.constants import STATUS_APPROVAL_FUZZY_MATCHING, STATUS_COMPLETED

from tests.test_utils import function_test


@pytest.mark.vcr
def test_find_matching_workflows():
    workflow_data = {
        "id": "7b617859-cb4f-4526-aa85-ec5291dc141b",
        "data": {
            "arxiv_eprints": [{"value": "2502.05665"}, {"value": "2504.01123"}],
            "dois": [{"value": "10.1103/fc8j-tb8k"}],
        },
    }
    statuses = [STATUS_APPROVAL_FUZZY_MATCHING, STATUS_COMPLETED]

    matches = function_test(
        opensearch.find_matching_workflows,
        params={"workflow": workflow_data, "statuses": statuses},
    )

    assert len(matches) == 2
