import logging
import os
import re
from itertools import chain
from tempfile import TemporaryDirectory

import requests
from airflow.exceptions import AirflowFailException
from hooks.backoffice.workflow_management_hook import (
    HEP,
    WorkflowManagementHook,
)
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from idutils import is_arxiv_post_2007
from include.utils.constants import (
    DECISION_AUTO_REJECT,
    DECISION_HEP_REJECT,
    LITERATURE_PID_TYPE,
    STATUS_COMPLETED,
)
from inspire_schemas.readers import LiteratureReader
from inspire_utils.dedupers import dedupe_list
from inspire_utils.record import get_value
from invenio_classifier.reader import KeywordToken
from parsel import Selector
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
        response (str or Response): the response object or url string.
    Returns:
        bool: whether the response url points to a PDF.
    """

    if isinstance(response, str):
        response = requests.get(response, allow_redirects=True, stream=True)

    found = next(response.iter_content(10000), b"").find(b"%PDF")

    return found >= 0


def post_pdf_to_grobid(workflow, s3_hook, process_fulltext=False):
    """Posts the PDF document attached to the workflow to GROBID for processing.
    Args:
        workflow_id (str): the workflow id.
        workflow (dict): the workflow data.
        s3_hook (S3Hook): the S3 hook to download the document.
        process_fulltext (bool): whether to process the fulltext or only the header.
    Returns:
        Response: the GROBID response.
    """

    s3_key = get_document_key_in_workflow(workflow)
    if not s3_key:
        return

    workflow_id = workflow["id"]

    with TemporaryDirectory(prefix="grobid") as tmp_dir:
        document_path = s3_hook.download_file(
            f"{workflow_id}/documents/{s3_key}",
            local_path=tmp_dir,
        )

        with open(document_path, "rb") as document_file:
            document = document_file.read()
        files = {"input": document}
        if not process_fulltext:
            files.update({"includeRawAffiliations": "1", "consolidateHeader": "1"})

        grobid_http_hook = GenericHttpHook(
            http_conn_id="grobid_connection",
            method="POST",
            headers={"Accept": "application/xml"},
        )

        api = (
            "api/processFulltextDocument"
            if process_fulltext
            else "api/processHeaderDocument"
        )
        try:
            response = grobid_http_hook.call_api(api, files=files)
        except RetryError as e:
            if "500:Internal Server Error" in str(e.last_attempt.exception()):
                logger.warning("Grobid service failed: %s", str(e))
                return
            raise AirflowFailException(
                f"Grobid service is unavailable: {str(e)}"
            ) from e

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


def build_matching_workflow_filter_params(workflow_data, statuses):
    filter_params = {
        "status__in": {"__".join(statuses)},
    }

    for key in ["arxiv_eprints", "dois"]:
        if key in workflow_data["data"]:
            if "search" not in filter_params:
                filter_params["search"] = []

            for item in workflow_data["data"][key]:
                filter_params["search"].append(
                    f"data.{key}.value.keyword:{item['value']}"
                )
    return filter_params


def find_matching_workflows(workflow, statuses=None):
    filter_params = build_matching_workflow_filter_params(workflow, statuses)

    if "search" in filter_params:
        matches = WorkflowManagementHook(HEP).filter_workflows(filter_params)
        matches["results"] = [
            match for match in matches["results"] if match["id"] != workflow["id"]
        ]
        return matches["results"]
    return []


def has_same_source(workflow_1, workflow_2):
    return (
        get_value(workflow_1, "data.acquisition_source.source").lower()
        == get_value(workflow_2, "data.acquisition_source.source").lower()
    )


def has_previously_rejected_wf_in_backoffice_w_same_source(workflow_data):
    workflow_management_hook = WorkflowManagementHook(HEP)

    matches = find_matching_workflows(workflow_data, [STATUS_COMPLETED])

    for workflow in matches:
        workflow_with_decisions = workflow_management_hook.get_workflow(workflow["id"])
        if get_decision(
            workflow_with_decisions.get("decisions"),
            [DECISION_HEP_REJECT, DECISION_AUTO_REJECT],
        ) and has_same_source(workflow_data, workflow_with_decisions):
            logger.info(
                f"Found previously rejected workflow with id "
                f"'{workflow_with_decisions['id']}' from same source."
            )
            return True

    return False


def get_record_url(metadata, inspire_http_hook):
    base_url = inspire_http_hook.get_url()
    recid = metadata.get("control_number")
    return os.path.join(base_url, "record", str(recid))


def is_arxiv_paper(metadata):
    reader = LiteratureReader(metadata)
    method = reader.method
    source = reader.source

    is_submission_with_arxiv = method == "submitter" and "arxiv_eprints" in metadata
    is_harvested_from_arxiv = method == "hepcrawl" and source.lower() == "arxiv"

    return is_submission_with_arxiv or is_harvested_from_arxiv


def get_fulltext(workflow, s3_hook):
    grobid_response = post_pdf_to_grobid(workflow, s3_hook, process_fulltext=True)
    if not grobid_response:
        return
    xml_data = grobid_response.text
    xml = Selector(text=xml_data, type="xml")
    xml.remove_namespaces()
    text = xml.getall()
    fulltext = " ".join(text)
    return fulltext


def check_if_france_in_fulltext(fulltext):
    if not fulltext:
        return
    regex = re.compile(r"\bfrance\b|in2p3", re.UNICODE | re.IGNORECASE)
    return regex.search(fulltext)


def get_curation_ticket_context(data, inspire_http_hook):
    email = data["acquisition_source"].get("email", "")
    recid = data.get("control_number")
    base_url = inspire_http_hook.get_url()
    record_url = os.path.join(base_url, "record", str(recid))
    context = {
        "email": email,
        "recid": recid,
        "record_url": record_url,
        "server_name": base_url,
    }
    return context


def check_if_france_in_raw_affiliations(workflow):
    raw_affs = get_value(workflow, "data.authors.raw_affiliations.value", [])
    for aff in chain.from_iterable(raw_affs):
        if "france" in aff.lower() or "in2p3" in aff.lower():
            return True


def check_if_germany_in_fulltext(fulltext):
    if not fulltext:
        return
    regex = re.compile(r"\b(Germany|Deutschland)\b", re.UNICODE | re.IGNORECASE)
    return regex.search(fulltext)


def check_if_germany_in_raw_affiliations(workflow):
    raw_affs = get_value(workflow, "data.authors.raw_affiliations.value", [])
    for aff in chain.from_iterable(raw_affs):
        if "germany" in aff.lower() or "deutschland" in aff.lower():
            return True


def check_if_uk_in_fulltext(fulltext):
    if not fulltext:
        return
    regex = re.compile(
        r"\b(UK|United\s+Kingdom|England|Scotland|Northern\s+Ireland)\b",
        re.UNICODE | re.IGNORECASE,
    )
    return regex.search(fulltext)


def check_if_uk_in_raw_affiliations(workflow):
    raw_affs = get_value(workflow, "data.authors.raw_affiliations.value", [])
    regex = re.compile(
        r"\b(UK|United\s+Kingdom|England|Scotland|Northern\s+Ireland)\b",
        re.UNICODE | re.IGNORECASE,
    )
    for aff in chain.from_iterable(raw_affs):
        if regex.search(aff):
            return True


def check_if_cern_candidate(workflow):
    cern_experiments = [
        "AMS",
        "CALICE",
        "CHIC",
        "CLEAR",
        "CLIC",
        "CLICdp",
        "CLOUD",
        "CROWS",
        "EEE",
        "EXPLORER",
        "FASER",
        "IAXO",
        "LAGUNA-LBNO",
        "LARP",
        "MATHUSLA",
        "MERIT",
        "OPAL",
        "ProtoDUNE-DP",
        "ProtoDUNE-SP",
        "SND@LHC",
        "XSEN",
    ]
    cern_collaborations = [
        "ALICE",
        "AMS",
        "ATLAS",
        "CLEAR",
        "CLIC",
        "CLICdp",
        "CLOUD",
        "CMS",
        "COMPASS",
        "FASER",
        "FCC",
        "ISOLDE",
        "LAGUNA-LBNO",
        "LHCb",
        "LHCf",
        "MATHUSLA",
        "MEDICIS",
        "MERIT",
        "SHINE",
        "SHiP",
        "SND@LHC",
        "TOTEM",
        "n_TOF",
    ]

    non_cern_collaborations = ["CDF", "D0", "NANCY", "nanograv", "PLANCK"]

    external_schemas = get_value(
        workflow, "data.external_system_identifiers.schema", []
    )
    private_notes = get_value(workflow, "data._private_notes.value", [])
    collections = get_value(workflow, "data._collections", [])
    authors_affils = get_value(workflow, "data.authors.affiliations.value", [])

    corporate_authors = get_value(workflow, "data.corporate_author", [])
    supervisors_affils = get_value(workflow, "data.supervisors.affiliations.value", [])

    collabs = get_value(workflow, "data.collaborations.value", [])
    experiments = get_value(workflow, "data.accelerator_experiments.legacy_name", [])

    report_nums = get_value(workflow, "data.report_numbers.value", [])

    if any(schema.lower() in ("cds", "cdsrdm") for schema in external_schemas):
        return False

    if any("Not CERN" in private_note for private_note in private_notes):
        return False

    if "CDS Hidden" in collections:
        return False

    if any(
        "uct-cern res. ctr." in a.lower() for a in chain.from_iterable(authors_affils)
    ):
        return False

    if any(coll in non_cern_collaborations for coll in collabs):
        return False

    if any("CERN" in corp_author for corp_author in corporate_authors):
        return True

    if any("cern" in a.lower() for a in chain.from_iterable(authors_affils)):
        return True

    if any("cern" in a.lower() for a in chain.from_iterable(supervisors_affils)):
        return True

    if any(str(r).lower().startswith("cern-") for r in report_nums):
        return True

    if any(c.startswith(("NA", "RD", "CERN")) for c in collabs):
        return True

    if any(exp in cern_experiments for exp in experiments):
        return True
    if any(coll in cern_collaborations for coll in collabs):
        return True


def get_curation_ticket_subject(data):
    report_numbers = get_value(data, "report_numbers.value", [])
    dois = [f"doi:{doi}" for doi in get_value(data, "dois.value", [])]
    recid = data.get("control_number")
    arxiv_ids = get_value(data, "arxiv_eprints.value", [])
    arxiv_ids = [
        f"arXiv:{arxiv_id}"
        for arxiv_id in arxiv_ids
        if arxiv_id and is_arxiv_post_2007(arxiv_id)
    ]

    subject_parts = arxiv_ids + dois + report_numbers + [f"(#{recid})"]
    return " ".join(p for p in subject_parts if p is not None)


def get_reply_curation_context(
    metadata,
    inspire_http_hook,
):
    email = metadata["acquisition_source"].get("email", "")
    return {
        "user_name": email,
        "title": LiteratureReader(metadata).title,
        "record_url": get_record_url(metadata, inspire_http_hook),
    }


def save_workflow(workflow, collection=HEP):
    response = WorkflowManagementHook(collection).update_workflow(
        workflow["id"], workflow
    )
    return response.json()
