import logging
from tempfile import TemporaryDirectory

from airflow.sdk import Variable
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from inspire_utils.dedupers import dedupe_list
from inspire_utils.record import get_value
from invenio_classifier.reader import KeywordToken

logger = logging.getLogger(__name__)


def get_decision(decisions, action):
    for decision in decisions:
        if decision["action"] == action:
            return decision
    return None


def normalize_collaborations(workflow_data):
    inspire_http_hook = InspireHttpHook()

    collaborations = get_value(workflow_data, "collaborations", [])

    if not collaborations:
        return

    response = inspire_http_hook.call_api(
        endpoint="api/curation/literature/collaborations-normalization",
        method="GET",
        json={"collaborations": collaborations},
    )
    response.raise_for_status()
    obj_accelerator_experiments = workflow_data.get("accelerator_experiments", [])
    json_response = response.json()

    normalized_accelerator_experiments = json_response["accelerator_experiments"]

    if normalized_accelerator_experiments or obj_accelerator_experiments:
        accelerator_experiments = dedupe_list(
            obj_accelerator_experiments + normalized_accelerator_experiments
        )
        normalized_collaborations = json_response["normalized_collaborations"]

        return accelerator_experiments, normalized_collaborations


def clean_instances_from_data(output):
    """Check if specific keys are of KeywordToken and replace them with their id."""
    new_output = {}
    for output_key in output:
        keywords = output[output_key]
        for key in keywords:
            if isinstance(key, KeywordToken):
                keywords[key.id] = keywords.pop(key)
        new_output[output_key] = keywords
    return new_output


def get_document_key_in_workflow(workflow):
    """Obtains s3 key for the first document attached to a workflow.
    Arg:
        workflow: workflow data object
    Returns:
        str: s3 key of the document or None if no document is found
    """
    documents = workflow["data"].get("documents", [])
    fulltexts = [document for document in documents if document.get("fulltext")]
    documents = fulltexts or documents

    if not documents:
        logger.info("No document available")
        return None
    elif len(documents) > 1:
        logger.error("More than one document in workflow, first one used")

    key = documents[0]["key"]
    logger.info('Using document with key "%s"', key)
    return key


def post_pdf_to_grobid(workflow, grobid_api_path, s3_hook, bucket_name, **kwargs):
    s3_key = get_document_key_in_workflow(workflow)
    if not s3_key:
        return

    with TemporaryDirectory(prefix="grobid") as tmp_dir:
        document_path = s3_hook.download_file(
            f"{workflow['workflow_id']}-documents/{s3_key}",
            bucket_name,
            tmp_dir,
        )

        with open(document_path, "rb") as document_file:
            document = document_file.read()
        data = {"input": document}
        data.update(kwargs)
        grobid_url = Variable.get["GROBID_URL"]

        classifier_http_hook = GenericHttpHook(
            http_conn_id="grobid_connection",
            method="POST",
            headers={"Accept": "application/xml"},
        )
        response = classifier_http_hook.call_api(
            grobid_url, params=grobid_api_path, files=data
        )
        response.raise_for_status()

    return response
