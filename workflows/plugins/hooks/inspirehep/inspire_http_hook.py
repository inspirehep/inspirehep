import logging

from airflow.models import Variable
from hooks.generic_http_hook import GenericHttpHook

logger = logging.getLogger()


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

    @property
    def headers(self) -> dict:
        return {
            "Authorization": f'Bearer {Variable.get("inspire_token")}',
            "Accept": "application/vnd+inspire.record.raw+json",
        }

    def get_backoffice_url(self, workflow_id: str) -> str:
        self.get_conn()
        return f"{self.base_url}/backoffice/{workflow_id}"

    def create_ticket(
        self, functional_category, template_name, subject, email, template_context
    ):
        # TODO add docstring
        endpoint = "/api/tickets/create"

        request_data = {
            "functional_category": functional_category,
            "template": template_name,
            "subject": subject,
            "template_context": template_context,
            "caller_email": email,
        }

        return self.call_api(endpoint=endpoint, data=request_data, method="POST")

    def reply_ticket(self, ticket_id, template, template_context, email):
        # TODO add docstring
        endpoint = "/api/tickets/reply"

        request_data = {
            "ticket_id": str(ticket_id),
            "template": template,
            "template_context": template_context,
            "user_email": email,
        }
        logging.info(f"Replying to ticket {ticket_id}")

        return self.call_api(endpoint=endpoint, data=request_data, method="POST")

    def close_ticket(self, ticket_id, template=None, template_context=None):
        # TODO add docstring
        endpoint = "/api/tickets/resolve"

        request_data = {"ticket_id": str(ticket_id)}
        if template is not None:
            request_data.update(
                {
                    "template": template,
                    "template_context": template_context,
                }
            )

        logging.info(f"Closing ticket {ticket_id}")

        return self.call_api(endpoint=endpoint, data=request_data, method="POST")
