from airflow.sdk import task
from include.utils.constants import ARXIV_CATEGORIES
from include.utils.s3 import S3JsonStore
from inspire_schemas.utils import classify_field
from inspire_utils.record import get_value


@task
def remove_inspire_categories_derived_from_core_arxiv_categories(**context):
    s3_store = S3JsonStore(aws_conn_id="s3_conn")

    workflow_id = context["params"]["workflow_id"]
    workflow_data = s3_store.read_workflow(workflow_id)
    data = workflow_data.get("data", {})

    if not data.get("arxiv_eprints"):
        return

    core_terms = {
        classify_field(arxiv_category)
        for arxiv_category in get_value(data, "arxiv_eprints[0].categories", [])
        if arxiv_category in ARXIV_CATEGORIES["core"]
    }

    # ARXIV_CATEGORIES["non-core"] only lists the non-core categories we fully
    # harvest, so anything derived from an arXiv category outside both lists
    # (e.g. math.AG) is not core and has to be kept
    remaining_inspire_categories = [
        category
        for category in data.get("inspire_categories", [])
        if not (
            category.get("source") == "arxiv" and category.get("term") in core_terms
        )
    ]

    data["inspire_categories"] = remaining_inspire_categories
    s3_store.write_workflow(workflow_data)
