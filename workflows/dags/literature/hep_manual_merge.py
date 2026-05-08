import datetime
import logging
from copy import deepcopy

from airflow.sdk import Param, dag, task
from airflow.sdk.exceptions import AirflowException
from dateutil import parser
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils import s3, workflows
from include.utils.alerts import FailedDagNotifier
from include.utils.constants import (
    DECISION_MANUAL_MERGE_APPROVE,
    LITERATURE_PID_TYPE,
    STATUS_APPROVAL_MERGE,
    STATUS_COMPLETED,
)
from inspire_json_merger.api import merge
from inspire_utils.record import get_value
from json_merger.errors import MaxThresholdExceededError
from literature.set_workflow_status_tasks import (
    set_workflow_status_to_running,
)
from literature.validate import validate_record

logger = logging.getLogger(__name__)


@dag(
    params={
        "workflow_id": Param(type="string"),
        "head_control_number": Param(type="integer"),
        "update_control_number": Param(type="integer"),
    },
    default_args={
        "on_failure_callback": FailedDagNotifier(),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    tags=[HEP, "manual-merge"],
)
def hep_manual_merge_dag():
    """Manual merge DAG for literature records."""

    s3_store = s3.S3JsonStore(aws_conn_id="s3_conn")
    workflow_management_hook = WorkflowManagementHook(HEP)
    inspire_http_hook = InspireHttpHook()
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()

    @task()
    def get_records(**context):
        workflow_id = context["params"]["workflow_id"]
        head_control_number = context["params"]["head_control_number"]
        update_control_number = context["params"]["update_control_number"]

        if head_control_number == update_control_number:
            raise AirflowException("Head and update control numbers must be different")

        head_record_data = inspire_http_record_management_hook.get_record(
            pid_type=LITERATURE_PID_TYPE,
            control_number=head_control_number,
        )
        update_record_data = inspire_http_record_management_hook.get_record(
            pid_type=LITERATURE_PID_TYPE,
            control_number=update_control_number,
        )

        s3_store.write_object(head_record_data, f"{workflow_id}/head_record.json")
        s3_store.write_object(update_record_data, f"{workflow_id}/update_record.json")

    @task
    def merge_records(**context):
        workflow_id = context["params"]["workflow_id"]
        head_control_number = context["params"]["head_control_number"]
        update_control_number = context["params"]["update_control_number"]

        head_record = s3_store.read_workflow(workflow_id, filename="head_record.json")
        update_record = s3_store.read_workflow(
            workflow_id, filename="update_record.json"
        )

        head_uuid = head_record["uuid"]
        head_revision_id = head_record["revision_id"]
        head_version_id = head_revision_id + 1
        update_uuid = update_record["uuid"]

        try:
            merged, conflicts = merge(
                head=head_record["metadata"],
                root={},
                update=update_record["metadata"],
            )
        except MaxThresholdExceededError as exc:
            raise AirflowException(f"Conflict resolution failed. {exc}") from None

        merged["control_number"] = head_control_number

        deleted_records = deepcopy(merged.get("deleted_records", []))
        update_record_ref = {
            "$ref": (
                f"{inspire_http_hook.get_url().rstrip('/')}"
                f"/api/{LITERATURE_PID_TYPE}/{update_control_number}"
            )
        }
        if update_record_ref not in deleted_records:
            deleted_records.append(update_record_ref)
        merged["deleted_records"] = deleted_records

        workflow_data = {
            "id": workflow_id,
            "data": merged,
            "merge_details": {
                "head_control_number": head_control_number,
                "update_control_number": update_control_number,
                "head_uuid": str(head_uuid),
                "update_uuid": str(update_uuid),
                "head_version_id": head_version_id,
                "merger_head_revision": head_revision_id,
            },
        }

        if conflicts:
            workflow_data["merge_details"]["conflicts"] = conflicts

        workflow_management_hook.partial_update_workflow(
            workflow_id=workflow_id,
            workflow_partial_update_data={
                "data": workflow_data["data"],
                "merge_details": workflow_data["merge_details"],
            },
        )
        s3_store.write_workflow(workflow_data)

    @task.short_circuit
    def await_merge_conflicts_resolved(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = workflow_management_hook.get_workflow(workflow_id)
        merge_details = workflow_data.get("merge_details") or {}
        conflicts = get_value(merge_details, "conflicts")
        is_conflicts_resolved = workflows.get_decision(
            workflow_data.get("decisions"),
            DECISION_MANUAL_MERGE_APPROVE,
        )

        if conflicts and not is_conflicts_resolved:
            workflow_management_hook.set_workflow_status(
                status_name=STATUS_APPROVAL_MERGE,
                workflow_id=workflow_id,
            )
            return False
        return True

    @task
    def save_roots(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3_store.read_workflow(workflow_id)
        merge_details = workflow_data.get("merge_details") or {}
        head_uuid = merge_details.get("head_uuid")
        update_uuid = merge_details.get("update_uuid")

        head_roots = workflows.get_all_wf_record_sources(head_uuid)
        update_roots = workflows.get_all_wf_record_sources(update_uuid)

        head_sources = {h["source"]: h for h in head_roots}
        for update_root in update_roots:
            if update_root["source"] not in head_sources or parser.parse(
                head_sources[update_root["source"]]["updated"]
            ) < parser.parse(update_root["updated"]):
                workflows.add_wf_record_source(
                    record_uuid=head_uuid,
                    source=update_root["source"],
                    json=update_root["json"],
                )
            workflows.delete_wf_record_source(
                record_uuid=update_uuid,
                source=update_root["source"],
            )

    @task
    def store_record(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3_store.read_workflow(workflow_id)
        workflow_data = workflows.store_record_inspirehep_api(workflow_data, True)
        s3_store.write_workflow(workflow_data)

    @task
    def save_and_complete_workflow(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3_store.read_workflow(workflow_id)
        workflow_data["status"] = STATUS_COMPLETED
        workflow_management_hook.update_workflow(workflow_id, workflow_data)

    (
        set_workflow_status_to_running()
        >> get_records()
        >> merge_records()
        >> await_merge_conflicts_resolved()
        >> validate_record()
        >> save_roots()
        >> store_record()
        >> save_and_complete_workflow()
    )


hep_manual_merge_dag()
