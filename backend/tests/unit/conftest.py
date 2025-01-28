import mock
import pytest


@pytest.fixture(autouse=True)
def mock_get_inspirehep_url():
    with mock.patch(
        "inspirehep.records.marshmallow.literature.ui.get_inspirehep_url"
    ) as get_inspirehep_url_mock:
        get_inspirehep_url_mock.return_value = "https://inspirebeta.net"
        yield get_inspirehep_url_mock
