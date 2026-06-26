from unittest import mock

import pytest
from inspirehep.factory import create_app


@pytest.fixture(scope="session")
def app():
    return create_app(TESTING=True, SERVER_NAME="localhost:5000")
    

@pytest.fixture(autouse=True)
def _app_context(app):
    with app.app_context():
        yield


@pytest.fixture(autouse=True)
def mock_get_inspirehep_url():
    with mock.patch(
        "inspirehep.records.marshmallow.literature.ui.get_inspirehep_url"
    ) as get_inspirehep_url_mock:
        get_inspirehep_url_mock.return_value = "https://inspirebeta.net"
        yield get_inspirehep_url_mock
