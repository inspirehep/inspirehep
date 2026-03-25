import logging

from hooks.generic_http_hook import GenericHttpHook

logger = logging.getLogger()

LITERATURE_ARXIV_CURATION_FUNCTIONAL_CATEGORY = "arXiv curation"
LITERATURE_SUBMISSIONS_FUNCTIONAL_CATEGORY = "Literature submissions"
LITERATURE_HAL_CURATION_FUNCTIONAL_CATEGORY = "HAL curation"
LITERATURE_GERMAN_CURATION_FUNCTIONAL_CATEGORY = "German curation"
LITERATURE_UK_CURATION_FUNCTIONAL_CATEGORY = "UK curation"
LITERATURE_CDS_CURATION_FUNCTIONAL_CATEGORY = "CDS curation"
LITERATURE_PUBLISHER_CURATION_FUNCTIONAL_CATEGORY = "Publisher curation"
AUTHOR_SUBMIT_FUNCTIONAL_CATEGORY = "Author submissions"
AUTHOR_CURATION_FUNCTIONAL_CATEGORY = "Author curation"
AUTHOR_UPDATE_FUNCTIONAL_CATEGORY = "Author updates"


class InspireHttpHook(GenericHttpHook):
    """
    Hook to interact with Inspire API
    It overrides the original `run` method in HttpHook so that
    we can pass data argument as data, not params
    """

    def __init__(self, method="GET", http_conn_id="inspire_connection"):
        super().__init__(method=method, http_conn_id=http_conn_id)

    def get_backoffice_url(self, workflow_type: str, workflow_id: str) -> str:
        """Build the backoffice URL for a workflow."""
        self.get_conn()
        return f"{self.base_url}/backoffice/{workflow_type}/{workflow_id}"

    def create_ticket(
        self, functional_category, template_name, subject, email, template_context
    ):
        """Create a backoffice ticket with the given template and context."""
        endpoint = "/api/tickets/create"

        request_data = {
            "functional_category": functional_category,
            "template": template_name,
            "subject": subject,
            "template_context": template_context,
            "caller_email": email,
        }

        return self.call_api(endpoint=endpoint, json=request_data, method="POST")

    def reply_ticket(self, ticket_id, template, template_context, email):
        """Reply to an existing ticket using a template and user email."""
        endpoint = "/api/tickets/reply"

        request_data = {
            "ticket_id": str(ticket_id),
            "template": template,
            "template_context": template_context,
            "user_email": email,
        }
        logging.info(f"Replying to ticket {ticket_id}")

        return self.call_api(endpoint=endpoint, json=request_data, method="POST")

    def close_ticket(
        self, ticket_id, template=None, template_context=None, message=None
    ):
        """Resolve a ticket and optionally send a templated
        reply or free-form message."""
        endpoint = "/api/tickets/resolve"

        request_data = {"ticket_id": str(ticket_id)}
        if template is not None:
            request_data.update(
                {
                    "template": template,
                    "template_context": template_context,
                }
            )
        if message is not None:
            request_data["message"] = message

        logging.info(f"Closing ticket {ticket_id}")

        return self.call_api(endpoint=endpoint, json=request_data, method="POST")
