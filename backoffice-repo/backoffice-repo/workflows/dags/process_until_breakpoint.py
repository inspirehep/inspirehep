import datetime
import json

from airflow.decorators import dag, task
from airflow.operators.python import ShortCircuitOperator
from airflow.utils.trigger_rule import TriggerRule


@dag(
    start_date=datetime.datetime(2021, 1, 1),
    schedule=None,
    params={"approved": True},
)
def process_untill_breakpoint():
    def check_approval(**context):
        return not context["params"]["approved"]

    @task
    def fetch_document(filename: str) -> dict:
        from include.utils.s3_client import get_s3_client

        s3_client = get_s3_client()
        s3_client.download_file("inspire-incoming", filename, f"./{filename}")
        with open(f"./{filename}") as f:
            data = json.load(f)
        return data

    @task()
    def normalize_affiliations(data):
        from hooks.inspire_connection_hook import call_inspire_api_with_hook
        from include.inspire.affiliations_normalization import (
            assign_normalized_affiliations,
        )

        endpoint = "/curation/literature/affiliations-normalization"
        request_data = {"authors": data["authors"], "workflow_id": 1}
        result = call_inspire_api_with_hook(endpoint=endpoint, data=request_data)
        data = assign_normalized_affiliations(result.json(), data=data)
        return data

    def auto_approval(**kwargs):
        from include.inspire.approval import auto_approve

        data = kwargs["task_instance"].xcom_pull(task_ids="normalize_affiliations")
        return bool(auto_approve(data))

    @task(trigger_rule=TriggerRule.NONE_FAILED)
    def validate():
        return

    check_approval = ShortCircuitOperator(
        task_id="check_approval",
        ignore_downstream_trigger_rules=False,
        python_callable=check_approval,
    )
    fetch_document_task = fetch_document("test.json")
    normalize_affiliations_task = normalize_affiliations(fetch_document_task)
    auto_approval = ShortCircuitOperator(
        task_id="auto_approval", python_callable=auto_approval
    )
    validation = validate()

    (
        check_approval
        >> fetch_document_task
        >> normalize_affiliations_task
        >> auto_approval
        >> validation
    )


process_untill_breakpoint()
