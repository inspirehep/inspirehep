from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import task
from include.utils import s3
from include.utils.constants import ARXIV_CATEGORIES
from inspire_schemas.utils import classify_field
from inspire_utils.record import get_value


@task
def remove_inspire_categories_derived_from_core_arxiv_categories(**context):
    s3_hook = S3Hook(aws_conn_id="s3_conn")

    workflow_id = context["params"]["workflow_id"]
    workflow_data = s3.read_workflow(s3_hook, workflow_id)
    data = workflow_data.get("data", {})

    if not data.get("arxiv_eprints"):
        return

    inspire_categories_without_arxiv_sourced = [
        category
        for category in data.get("inspire_categories", [])
        if category.get("source") != "arxiv"
    ]

    non_core_arxiv_categories = [
        arxiv_category
        for arxiv_category in get_value(data, "arxiv_eprints[0].categories", [])
        if arxiv_category in ARXIV_CATEGORIES["non-core"]
    ]
    inspire_categories_for_non_core_arxiv_categories = [
        {"term": classify_field(arxiv_category), "source": "arxiv"}
        for arxiv_category in non_core_arxiv_categories
    ]
    inspire_categories_without_arxiv_sourced.extend(
        inspire_categories_for_non_core_arxiv_categories
    )
    data["inspire_categories"] = inspire_categories_without_arxiv_sourced
    s3.write_workflow(s3_hook, workflow_data)
