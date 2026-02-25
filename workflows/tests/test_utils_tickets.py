from unittest.mock import patch

from include.utils import tickets


def test_get_functional_categories_from_fulltext_or_raw_affiliations(datadir):
    workflow = {
        "data": {
            "core": True,
        }
    }

    s3_hook = None

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, s3_hook
        )
    )

    assert len(functional_categories) == 0


@patch(
    "include.utils.workflows.get_fulltext",
    return_value="This is a fulltext mentioning France.",
)
def test_get_functional_categories_from_fulltext_or_raw_affiliations_french_fulltext(
    mock_get_fulltext,
):
    workflow = {
        "data": {
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "arXiv",
            }
        }
    }

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, None, None
        )
    )

    assert functional_categories == [
        tickets.LITERATURE_HAL_CURATION_FUNCTIONAL_CATEGORY
    ]


@patch(
    "include.utils.workflows.get_fulltext",
    return_value="This is a fulltext mentioning UK.",
)
def test_get_functional_categories_from_fulltext_or_raw_affiliations_uk_fulltext(
    mock_get_fulltext,
):
    workflow = {
        "data": {
            "core": True,
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "arXiv",
            },
        }
    }

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, None, None
        )
    )

    assert functional_categories == [tickets.LITERATURE_UK_CURATION_FUNCTIONAL_CATEGORY]


@patch(
    "include.utils.workflows.get_fulltext",
    return_value="This is a fulltext mentioning UK, France and Germany.",
)
def test_get_functional_categories_from_fulltext_or_raw_affiliations_fr_ger_uk_fulltext(
    mock_get_fulltext,
):
    workflow = {
        "data": {
            "core": True,
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "arXiv",
            },
        }
    }

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, None, None
        )
    )

    assert tickets.LITERATURE_UK_CURATION_FUNCTIONAL_CATEGORY in functional_categories
    assert (
        tickets.LITERATURE_GERMAN_CURATION_FUNCTIONAL_CATEGORY in functional_categories
    )
    assert tickets.LITERATURE_HAL_CURATION_FUNCTIONAL_CATEGORY in functional_categories


def test_get_functional_categories_from_fulltext_or_raw_affiliations_cern():
    workflow = {
        "data": {
            "core": True,
            "authors": [
                {
                    "affiliations": [{"value": "CERN"}],
                    "full_name": "Moskovic, Micha",
                }
            ],
            "acquisition_source": {
                "method": "submitter",
                "source": "submitter",
            },
        }
    }

    functional_categories = (
        tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
            workflow, None, None
        )
    )

    assert functional_categories == [
        tickets.LITERATURE_CDS_CURATION_FUNCTIONAL_CATEGORY
    ]


def test_get_functional_category_and_ticket_type_from_publisher():
    workflow = {
        "data": {
            "core": True,
            "acquisition_source": {"source": "arXiv"},
        }
    }

    functional_category, ticket_type = (
        tickets.get_functional_category_and_ticket_type_from_publisher(workflow)
    )

    assert functional_category == tickets.LITERATURE_ARXIV_CURATION_FUNCTIONAL_CATEGORY
    assert ticket_type == tickets.TICKET_HEP_CURATION_CORE
