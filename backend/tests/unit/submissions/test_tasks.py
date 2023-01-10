import pytest
from mock import patch

from inspirehep.rt.tickets import CreateTicketException
from inspirehep.submissions.tasks import async_create_ticket_with_template


@patch("inspirehep.submissions.tasks.create_ticket_with_template")
@patch("inspirehep.submissions.tasks.current_app")
def test_async_create_ticket_with_template(mocked_current_app, mock_create_ticket):
    mocked_current_app.config = {"FEATURE_FLAG_ENABLE_SNOW": False}
    args = [
        "test",
        "test@guy.com",
        "/path/to/template",
        {"foo": "bar"},
        "Test Ticket",
        12345,
    ]
    async_create_ticket_with_template(*args)
    mock_create_ticket.assert_called_once_with(*args)


@patch("inspirehep.submissions.tasks.create_ticket_with_template", return_value=-1)
@patch("inspirehep.submissions.tasks.current_app")
def test_async_create_ticket_with_template_logs_on_error(
    mocked_current_app, mock_create_ticket
):
    mocked_current_app.config = {"FEATURE_FLAG_ENABLE_SNOW": False}
    args = [
        "test",
        "test@guy.com",
        "/path/to/template",
        {"foo": "bar"},
        "Test Ticket",
        12345,
    ]
    with pytest.raises(CreateTicketException):
        async_create_ticket_with_template(*args)
