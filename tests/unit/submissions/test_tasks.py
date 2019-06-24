import pytest
from mock import patch

from inspirehep.rt.tickets import CreateTicketException
from inspirehep.submissions.tasks import async_create_ticket_with_template


@patch("inspirehep.submissions.tasks.create_ticket_with_template")
def test_async_create_ticket_with_template(mock_create_ticket):
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
def test_async_create_ticket_with_template_logs_on_error(mock_create_ticket):
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
