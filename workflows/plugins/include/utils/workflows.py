import logging
from tempfile import TemporaryDirectory

from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.constants import LITERATURE_PID_TYPE
from inspire_utils.dedupers import dedupe_list
from inspire_utils.record import get_value
from invenio_classifier.reader import KeywordToken
from tenacity import RetryError

logger = logging.getLogger(__name__)


def get_decision(decisions, actions):
    if not decisions:
        return None

    actions = {actions} if isinstance(actions, str) else set(actions)

    for decision in decisions:
        if decision.get("action") in actions:
            return decision

    return None


def normalize_collaborations(metadata):
    inspire_http_hook = InspireHttpHook()

    collaborations = get_value(metadata, "collaborations", [])

    if not collaborations:
        return

    response = inspire_http_hook.call_api(
        endpoint="api/curation/literature/collaborations-normalization",
        method="GET",
        json={"collaborations": collaborations},
    )
    response.raise_for_status()
    obj_accelerator_experiments = metadata.get("accelerator_experiments", [])
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
            f"{workflow_id}/documents/{s3_key}",
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


def get_source_for_root(source):
    """Source for the root workflow object.
    Args:
        source(str): the record source.
    Return:
        (str): the source for the root workflow object.
    Note:
        For the time being any workflow with ``acquisition_source.source``
        different than ``arxiv`` and ``submitter`` will be stored as
        ``publisher``.
    """
    return source if source in ["arxiv", "submitter"] else "publisher"


def read_wf_record_source(record_uuid, source):
    """Retrieve a record from the ``WorkflowRecordSource`` table.
    Args:
        record_uuid(uuid): the uuid of the record
        source(string): the acquisition source value of the record
    Return:
        (dict): the given record, if any or None
    """
    if not source:
        return

    source = get_source_for_root(source)
    inspire_http_hook = InspireHttpHook()

    try:
        response = inspire_http_hook.call_api(
            endpoint="api/literature/workflows_record_sources",
            json={"record_uuid": str(record_uuid), "source": source.lower()},
        )
    except RetryError as e:
        if "404:Not Found" in str(e.last_attempt.exception()):
            return []

    if response.status_code == 200:
        return response.json()["workflow_sources"][0]

    return []


def store_record_inspirehep_api(workflow, is_update):
    """Saves record through inspirehep api by posting/pushing record to proper endpoint
    in inspirehep"""

    if is_update and "control_number" not in workflow["data"]:
        raise ValueError("Control number is missing")

    control_number = workflow["data"].get("control_number")
    return send_record_to_hep(workflow, control_number)


def send_record_to_hep(workflow, control_number=None):
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
    if control_number:
        head_version_id = workflow["merge_details"]["head_version_id"]

        response = inspire_http_record_management_hook.update_record(
            data=workflow["data"],
            pid_type=LITERATURE_PID_TYPE,
            control_number=control_number,
            revision_id=head_version_id,
        )

    else:
        response = inspire_http_record_management_hook.post_record(
            data=workflow["data"],
            pid_type=LITERATURE_PID_TYPE,
        )

    workflow["data"]["control_number"] = response.json()["metadata"]["control_number"]

    if not control_number:
        merge_details = workflow.get("merge_details") or {}
        merge_details["head_uuid"] = response.json()["uuid"]
        workflow["merge_details"] = merge_details

    return workflow


def set_flag(flag, value, workflow_data):
    """Sets a flag in the workflow data.

    Args:
        flag (str): The flag to set.
        value: The value to set for the flag.
        workflow_data (dict): The workflow data.
    """
    workflow_data.setdefault("flags", {})[flag] = value


def get_flag(flag, workflow_data):
    """Gets a flag from the workflow data.

    Args:
        flag (str): The flag to get.
        workflow_data (dict): The workflow data.
    """
    return workflow_data.get("flags", {}).get(flag)
