from airflow.decorators import task
from airflow.utils.trigger_rule import TriggerRule
from hooks.backoffice.workflow_ticket_management_hook import (
    WorkflowTicketManagementHook,
)
from hooks.inspirehep.inspire_http_hook import InspireHttpHook


@task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
def close_author_create_user_ticket(**context: dict) -> None:
    ticket_type = "author_create_user"
    ticket_id = WorkflowTicketManagementHook().get_ticket(
        workflow_id=context["params"]["workflow_id"], ticket_type=ticket_type
    )["ticket_id"]
    endpoint = "api/tickets/resolve"
    request_data = {"ticket_id": ticket_id}
    InspireHttpHook().call_api(endpoint=endpoint, data=request_data, method="POST")
