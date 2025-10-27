import logging
from tempfile import TemporaryDirectory

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


def delete_empty_key(workflow_data, key):
    if key in workflow_data["data"] and len(workflow_data["data"][key]) == 0:
        logger.info("Deleting %s from workflow. Key is empty.", key)
        del workflow_data["data"][key]


def is_pdf_link(response):
    """Verify if the response points to a PDF.

    Arg:
        response (Response): the HTTP response object.
    Returns:
        bool: whether the response url points to a PDF.
    """
    found = next(response.iter_content(10000), b"").find(b"%PDF")

    return found >= 0


def post_pdf_to_grobid(workflow_id, workflow, s3_hook, bucket_name):
    s3_key = get_document_key_in_workflow(workflow)
    if not s3_key:
        return

    with TemporaryDirectory(prefix="grobid") as tmp_dir:
        document_path = s3_hook.download_file(
            f"{workflow_id}-documents/{s3_key}",
            bucket_name,
            tmp_dir,
        )

        with open(document_path, "rb") as document_file:
            document = document_file.read()
        files = {"input": document}
        files.update({"includeRawAffiliations": "1", "consolidateHeader": "1"})

        grobid_http_hook = GenericHttpHook(
            http_conn_id="grobid_connection",
            method="POST",
            headers={"Accept": "application/xml"},
        )
        response = grobid_http_hook.call_api("api/processHeaderDocument", files=files)

    return response
