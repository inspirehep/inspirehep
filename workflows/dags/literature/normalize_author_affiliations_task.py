import logging

from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import task
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from include.utils import s3
from inspire_utils.record import get_value

logger = logging.getLogger(__name__)


@task
def normalize_author_affiliations(**context):
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    inspire_http_hook = InspireHttpHook()

    workflow_id = context["params"]["workflow_id"]
    workflow_data = s3.read_workflow(s3_hook, workflow_id)

    is_core = get_value(workflow_data, "data.core", False)

    if not is_core:
        return
    normalized_affiliation_response = inspire_http_hook.call_api(
        endpoint="api/curation/literature/affiliations-normalization",
        json={"authors": workflow_data["data"].get("authors", [])},
    )

    normalized_affiliations = normalized_affiliation_response.json()[
        "normalized_affiliations"
    ]

    for author, normalized_affiliation in zip(
        workflow_data["data"].get("authors", []),
        normalized_affiliations,
        strict=False,
    ):
        author_affiliations = author.get("affiliations", [])
        if author_affiliations:
            continue
        raw_affs = get_value(author, "raw_affiliations.value", [])
        if normalized_affiliation:
            author["affiliations"] = normalized_affiliation
            logger.info(
                "Normalized affiliations for author %s. Raw affiliations: %s."
                " Assigned affiliations: %s",
                author["full_name"],
                ",".join(raw_affs),
                normalized_affiliation,
            )
    s3.write_workflow(s3_hook, workflow_data)
