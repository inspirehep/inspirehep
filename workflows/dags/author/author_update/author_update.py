import datetime

from airflow.decorators import dag, task
from airflow.models.param import Param
from author.shared_tasks import set_submission_number
from hooks.backoffice.workflow_management_hook import AUTHORS, WorkflowManagementHook
from hooks.backoffice.workflow_ticket_management_hook import (
    AuthorWorkflowTicketManagementHook,
)
from hooks.inspirehep.inspire_http_hook import (
    AUTHOR_UPDATE_FUNCTIONAL_CATEGORY,
    InspireHttpHook,
)
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.alerts import dag_failure_callback
from include.utils.set_workflow_status import (
    get_wf_status_from_inspire_response,
)


@dag(
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    params={
        "workflow_id": Param(type="string", default=""),
        "data": Param(type="object", default={}),
        "collection": Param(type="string", default=AUTHORS),
    },
    catchup=False,
    on_failure_callback=dag_failure_callback,
    tags=[AUTHORS],
)
def author_update_dag():
    """
    DAG for updating author on Inspire.

    Tasks:
    1. Sets the workflow status to "running".
    2. Creates a ticket for author updates.
    3. Updates the author information in Inspire.
    4. Sets the workflow status to "completed".

    """
    inspire_http_hook = InspireHttpHook()
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
    workflow_management_hook = WorkflowManagementHook(AUTHORS)
    workflow_ticket_management_hook = AuthorWorkflowTicketManagementHook()

    @task
    def set_author_update_workflow_status_to_running(**context):
        status_name = "running"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    @task
    def create_ticket_on_author_update(**context):
        workflow_data = context["params"]["workflow"]["data"]
        email = workflow_data["acquisition_source"]["email"]

        subject = (
            f"Update to author {workflow_data.get('name').get('preferred_name')}"
            f" on INSPIRE"
        )
        recid = workflow_data["control_number"]
        url = inspire_http_hook.get_url()
        template_context = {
            "url": f"{url}/authors/{recid}",
            "bibedit_url": f"{url}/record/{recid}",
            "url_author_form": f"{url}/submissions/authors/{recid}",
        }

        response = inspire_http_hook.create_ticket(
            AUTHOR_UPDATE_FUNCTIONAL_CATEGORY,
            "curator_update_author",
            subject,
            email,
            template_context,
        )

        ticket_id = response.json()["ticket_id"]

        workflow_ticket_management_hook.create_ticket_entry(
            workflow_id=context["params"]["workflow_id"],
            ticket_type="author_update_curation",
            ticket_id=ticket_id,
        )

        return response.json()

    @task
    def update_author_on_inspire(**context):
        workflow_data = workflow_management_hook.get_workflow(
            workflow_id=context["params"]["workflow_id"]
        )
        control_number = workflow_data["data"]["control_number"]
        record_data = inspire_http_record_management_hook.get_record(
            pid_type="authors", control_number=control_number
        )
        record_data["metadata"].update(workflow_data["data"])
        response = inspire_http_record_management_hook.update_record(
            data=record_data["metadata"],
            pid_type="authors",
            control_number=control_number,
            revision_id=record_data["revision_id"] + 1,
        )
        status = get_wf_status_from_inspire_response(response)
        return status

    @task
    def set_author_update_workflow_status_to_completed(**context):
        status_name = "completed"
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    @task.branch
    def author_update_success_branch(**context):
        ti = context["ti"]
        workflow_status = ti.xcom_pull(task_ids="update_author_on_inspire")

        if workflow_status == "completed":
            return "set_author_update_workflow_status_to_completed"
        else:
            return "set_author_update_workflow_status_to_error"

    @task
    def set_author_update_workflow_status_to_error(**context):
        ti = context["ti"]
        status_name = ti.xcom_pull(task_ids="update_author_on_inspire")
        workflow_management_hook.set_workflow_status(
            status_name=status_name, workflow_id=context["params"]["workflow_id"]
        )

    # task dependencies
    (
        set_author_update_workflow_status_to_running()
        >> set_submission_number()
        >> create_ticket_on_author_update()
        >> update_author_on_inspire()
        >> author_update_success_branch()
        >> [
            set_author_update_workflow_status_to_error(),
            set_author_update_workflow_status_to_completed(),
        ]
    )


author_update_dag_instance = author_update_dag()
