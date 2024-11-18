import logging

import requests
from airflow.models import Variable
from airflow.providers.http.hooks.http import HttpHook
from hooks.tenacity_config import tenacity_retry_kwargs
from requests import Response

logger = logging.getLogger()


AUTHOR_SUBMIT_FUNCTIONAL_CATEGORY = "Author submissions"
AUTHOR_CURATION_FUNCTIONAL_CATEGORY = "Author curation"
AUTHOR_UPDATE_FUNCTIONAL_CATEGORY = "Author updates"


class InspireHttpHook(HttpHook):
    """
    Hook to interact with Inspire API
    It overrides the original `run` method in HttpHook so that
    we can pass data argument as data, not params
    """

    def __init__(self, method="GET", http_conn_id="inspire_connection"):
        super().__init__(method=method, http_conn_id=http_conn_id)

    @property
    def tenacity_retry_kwargs(self) -> dict:
        return tenacity_retry_kwargs()

    @property
    def headers(self) -> dict:
        return {
            "Authorization": f'Bearer {Variable.get("inspire_token")}',
            "Accept": "application/vnd+inspire.record.raw+json",
        }

    def run(
        self,
        endpoint: str,
        method: str = None,
        json: dict = None,
        data: dict = None,
        headers: dict = None,
        extra_options: dict = None,
    ):
        extra_options = extra_options or {}
        method = method or self.method
        session = self.get_conn(headers)

        if not self.base_url.endswith("/") and not endpoint.startswith("/"):
            url = self.base_url + "/" + endpoint
        else:
            url = self.base_url + endpoint

        req = requests.Request(method, url, json=json, data=data, headers=headers)

        prepped_request = session.prepare_request(req)
        self.log.info("Sending '%s' to url: %s", method, url)
        return self.run_and_check(session, prepped_request, extra_options)

    def call_api(self, method: str, endpoint: str, data: dict) -> Response:
        return self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            endpoint=endpoint,
            headers=self.headers,
            json=data,
            method=method,
        )

    def get_backoffice_url(self, workflow_id: str) -> str:
        self.get_conn()
        return f"{self.base_url}/backoffice/{workflow_id}"

    def get_url(self) -> str:
        self.get_conn()
        return self.base_url

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
        print(request_data)

        return self.call_api(endpoint=endpoint, data=request_data, method="POST")
