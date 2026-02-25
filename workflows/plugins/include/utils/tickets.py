import logging

from hooks.inspirehep.inspire_http_hook import (
    LITERATURE_ARXIV_CURATION_FUNCTIONAL_CATEGORY,
    LITERATURE_CDS_CURATION_FUNCTIONAL_CATEGORY,
    LITERATURE_GERMAN_CURATION_FUNCTIONAL_CATEGORY,
    LITERATURE_HAL_CURATION_FUNCTIONAL_CATEGORY,
    LITERATURE_PUBLISHER_CURATION_FUNCTIONAL_CATEGORY,
    LITERATURE_UK_CURATION_FUNCTIONAL_CATEGORY,
)
from include.utils import workflows
from include.utils.constants import (
    TICKET_HEP_CURATION_CORE,
    TICKET_HEP_PUBLISHER_CURATION_CORE,
)
from inspire_utils.record import get_value

logger = logging.getLogger(__name__)


def get_ticket_by_type(workflow, ticket_type):
    for ticket in workflow.get("tickets", []):
        if ticket["ticket_type"] == ticket_type:
            return ticket


def get_functional_categories_from_fulltext_or_raw_affiliations(
    workflow, s3_hook, is_core=True
):
    functional_categories = []
    is_core = get_value(workflow, "data.core")
    if workflows.is_arxiv_paper(workflow["data"]):
        fulltext = workflows.get_fulltext(workflow, s3_hook)

        if workflows.check_if_france_in_fulltext(fulltext):
            functional_categories.append(LITERATURE_HAL_CURATION_FUNCTIONAL_CATEGORY)
        if is_core:
            if workflows.check_if_germany_in_fulltext(fulltext):
                functional_categories.append(
                    LITERATURE_GERMAN_CURATION_FUNCTIONAL_CATEGORY
                )
            if workflows.check_if_uk_in_fulltext(fulltext):
                functional_categories.append(LITERATURE_UK_CURATION_FUNCTIONAL_CATEGORY)
            if workflows.check_if_cern_candidate(workflow):
                functional_categories.append(
                    LITERATURE_CDS_CURATION_FUNCTIONAL_CATEGORY
                )
    else:
        if workflows.check_if_france_in_raw_affiliations(workflow):
            functional_categories.append(LITERATURE_HAL_CURATION_FUNCTIONAL_CATEGORY)
        if is_core:
            if workflows.check_if_germany_in_raw_affiliations(workflow):
                functional_categories.append(
                    LITERATURE_GERMAN_CURATION_FUNCTIONAL_CATEGORY
                )
            if workflows.check_if_uk_in_raw_affiliations(workflow):
                functional_categories.append(LITERATURE_UK_CURATION_FUNCTIONAL_CATEGORY)
            if workflows.check_if_cern_candidate(workflow):
                functional_categories.append(
                    LITERATURE_CDS_CURATION_FUNCTIONAL_CATEGORY
                )

    return functional_categories


def get_functional_category_and_ticket_type_from_publisher(workflow):
    is_core = get_value(workflow, "data.core")
    is_publisher_paper = get_value(
        workflow, "data.acquisition_source.source"
    ).lower() not in {"arxiv", "submitter"}

    if is_core:
        if is_publisher_paper:
            return (
                LITERATURE_PUBLISHER_CURATION_FUNCTIONAL_CATEGORY,
                TICKET_HEP_PUBLISHER_CURATION_CORE,
            )
        else:
            return (
                LITERATURE_ARXIV_CURATION_FUNCTIONAL_CATEGORY,
                TICKET_HEP_CURATION_CORE,
            )
    return None, None
