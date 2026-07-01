from unittest.mock import MagicMock, patch

from include.utils import tickets
from include.utils.constants import (
    TICKET_HEP_CURATION,
    TICKET_HEP_CURATION_CORE,
    TICKET_HEP_SUBMISSION,
)


def test_get_ticket_by_type_str():
    workflow = {
        "tickets": [
            {"ticket_id": 1, "ticket_type": TICKET_HEP_CURATION},
            {"ticket_id": 2, "ticket_type": TICKET_HEP_SUBMISSION},
        ]
    }

    assert (
        tickets.get_ticket_by_type(workflow, TICKET_HEP_SUBMISSION)
        == (workflow["tickets"][1])
    )


def test_get_ticket_by_type_list():
    workflow = {
        "tickets": [
            {"ticket_id": 1, "ticket_type": TICKET_HEP_CURATION},
            {"ticket_id": 2, "ticket_type": TICKET_HEP_CURATION_CORE},
        ]
    }

    assert (
        tickets.get_ticket_by_type(
            workflow,
            [TICKET_HEP_SUBMISSION, TICKET_HEP_CURATION_CORE],
        )
        == workflow["tickets"][1]
    )


def test_get_ticket_by_type_returns_no_match():
    workflow = {
        "tickets": [
            {"ticket_id": 1, "ticket_type": TICKET_HEP_CURATION},
        ]
    }

    assert (
        tickets.get_ticket_by_type(
            workflow,
            [TICKET_HEP_SUBMISSION, TICKET_HEP_CURATION_CORE],
        )
        is None
    )


def test_get_functional_categories_from_fulltext_or_raw_affiliations(datadir):
    workflow = {
        "data": {
            "core": True,
        }
    }

    s3_hook = None

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, s3_hook
        )
    )

    assert len(functional_categories) == 0


@patch(
    "include.utils.workflows.get_fulltext",
    return_value="This is a fulltext mentioning France.",
)
def test_get_functional_categories_from_fulltext_or_raw_affiliations_french_fulltext(
    mock_get_fulltext,
):
    workflow = {
        "data": {
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "arXiv",
            }
        }
    }

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, None, None
        )
    )

    assert functional_categories == [
        tickets.LITERATURE_HAL_CURATION_FUNCTIONAL_CATEGORY
    ]


@patch(
    "include.utils.workflows.get_fulltext",
    return_value="This is a fulltext mentioning UK.",
)
def test_get_functional_categories_from_fulltext_or_raw_affiliations_uk_fulltext(
    mock_get_fulltext,
):
    workflow = {
        "data": {
            "core": True,
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "arXiv",
            },
        }
    }

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, None, None
        )
    )

    assert functional_categories == [tickets.LITERATURE_UK_CURATION_FUNCTIONAL_CATEGORY]


@patch(
    "include.utils.workflows.get_fulltext",
    return_value="This is a fulltext mentioning UK, France and Germany.",
)
def test_get_functional_categories_from_fulltext_or_raw_affiliations_fr_ger_uk_fulltext(
    mock_get_fulltext,
):
    workflow = {
        "data": {
            "core": True,
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "arXiv",
            },
        }
    }

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, None, None
        )
    )

    assert tickets.LITERATURE_UK_CURATION_FUNCTIONAL_CATEGORY in functional_categories
    assert (
        tickets.LITERATURE_GERMAN_CURATION_FUNCTIONAL_CATEGORY in functional_categories
    )
    assert tickets.LITERATURE_HAL_CURATION_FUNCTIONAL_CATEGORY in functional_categories


def test_get_functional_categories_from_fulltext_or_raw_affiliations_cern():
    workflow = {
        "data": {
            "core": True,
            "authors": [
                {
                    "affiliations": [{"value": "CERN"}],
                    "full_name": "Moskovic, Micha",
                }
            ],
            "acquisition_source": {
                "method": "submitter",
                "source": "submitter",
            },
        }
    }

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, None, None
        )
    )

    assert functional_categories == [
        tickets.LITERATURE_CDS_CURATION_FUNCTIONAL_CATEGORY
    ]


def test_get_functional_category_and_ticket_type_from_publisher():
    workflow = {
        "data": {
            "core": True,
            "acquisition_source": {"source": "arXiv"},
        }
    }

    functional_category, ticket_type = (
        tickets.get_functional_category_and_ticket_type_from_publisher(workflow)
    )

    assert functional_category == tickets.LITERATURE_ARXIV_CURATION_FUNCTIONAL_CATEGORY
    assert ticket_type == TICKET_HEP_CURATION_CORE


@patch("include.utils.tickets.LiteratureWorkflowTicketManagementHook")
@patch("include.utils.tickets.Variable.get", return_value="qa")
def test_create_ticket_calls_http_hook_and_creates_ticket_entry(
    mock_variable_get, mock_ticket_management_hook
):
    inspire_http_hook = MagicMock()
    inspire_http_hook.create_ticket.return_value.json.return_value = {
        "ticket_id": "SNOW-123"
    }

    ticket_id = tickets.create_ticket(
        inspire_http_hook=inspire_http_hook,
        functional_category="hep",
        template_name="curation_core",
        subject="Test subject",
        email="test@example.org",
        curation_context={"workflow": "context"},
        ticket_type=TICKET_HEP_CURATION_CORE,
        workflow_id="workflow-123",
    )

    assert ticket_id == "SNOW-123"
    inspire_http_hook.create_ticket.assert_called_once_with(
        "hep",
        "curation_core",
        "Test subject",
        "test@example.org",
        {"workflow": "context"},
    )
    mock_ticket_management_hook.return_value.create_ticket_entry.assert_called_once_with(
        workflow_id="workflow-123",
        ticket_type=TICKET_HEP_CURATION_CORE,
        ticket_id="SNOW-123",
    )


@patch("include.utils.tickets.LiteratureWorkflowTicketManagementHook")
@patch("include.utils.tickets.Variable.get", return_value="local")
def test_create_ticket_uses_local_ticket_id_without_http_call(
    mock_variable_get, mock_ticket_management_hook
):
    inspire_http_hook = MagicMock()

    ticket_id = tickets.create_ticket(
        inspire_http_hook=inspire_http_hook,
        functional_category="hep",
        template_name="curation_core",
        subject="Test subject",
        email="test@example.org",
        curation_context={"workflow": "context"},
        ticket_type=TICKET_HEP_CURATION_CORE,
        workflow_id="workflow-123",
    )

    assert ticket_id == f"local-{TICKET_HEP_CURATION_CORE}"
    inspire_http_hook.create_ticket.assert_not_called()
    mock_ticket_management_hook.return_value.create_ticket_entry.assert_called_once_with(
        workflow_id="workflow-123",
        ticket_type=TICKET_HEP_CURATION_CORE,
        ticket_id=f"local-{TICKET_HEP_CURATION_CORE}",
    )


@patch("include.utils.tickets.Variable.get", return_value="prod")
def test_reply_ticket_calls_http_hook_outside_local(mock_variable_get):
    inspire_http_hook = MagicMock()

    tickets.reply_ticket(
        inspire_http_hook=inspire_http_hook,
        ticket_id="SNOW-123",
        template="curator_submitted",
        template_context={"record_id": 123},
        email="test@example.org",
    )

    inspire_http_hook.reply_ticket.assert_called_once_with(
        "SNOW-123",
        "curator_submitted",
        {"record_id": 123},
        "test@example.org",
    )


@patch("include.utils.tickets.Variable.get", return_value="LOCAL")
def test_reply_ticket_skips_http_hook_in_local_environment(mock_variable_get):
    inspire_http_hook = MagicMock()

    tickets.reply_ticket(
        inspire_http_hook=inspire_http_hook,
        ticket_id="SNOW-123",
        template="curator_submitted",
        template_context={"record_id": 123},
        email="test@example.org",
    )

    inspire_http_hook.reply_ticket.assert_not_called()


@patch("include.utils.tickets.Variable.get", return_value="prod")
def test_close_ticket_calls_http_hook_outside_local(mock_variable_get):
    inspire_http_hook = MagicMock()

    tickets.close_ticket(
        inspire_http_hook=inspire_http_hook,
        ticket_id="SNOW-123",
        template="user_rejected",
        template_context={"record_id": 123},
        message="Rejected for testing",
    )

    inspire_http_hook.close_ticket.assert_called_once_with(
        "SNOW-123",
        "user_rejected",
        {"record_id": 123},
        "Rejected for testing",
    )


@patch("include.utils.tickets.Variable.get", return_value="local")
def test_close_ticket_skips_http_hook_in_local_environment(mock_variable_get):
    inspire_http_hook = MagicMock()

    tickets.close_ticket(
        inspire_http_hook=inspire_http_hook,
        ticket_id="SNOW-123",
        template="user_rejected",
        template_context={"record_id": 123},
        message="Rejected for testing",
    )

    inspire_http_hook.close_ticket.assert_not_called()
