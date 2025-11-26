from itertools import chain

from include.utils.constants import ARXIV_CATEGORIES
from inspire_schemas.readers.literature import LiteratureReader


def is_first_category_core(data):
    record_core_category = LiteratureReader(data).arxiv_categories[0]
    arxiv_core_categories = set(ARXIV_CATEGORIES.get("core", []))
    return record_core_category in arxiv_core_categories


def auto_approve(data):
    """Check if auto approve the current ingested article.

    Return:
        bool: True when the record belongs to an arXiv category that is fully
        harvested or if the primary category is `physics.data-an`, otherwise
        False.
    """
    return has_fully_harvested_category(data) or physics_data_an_is_primary_category(
        data
    )


def has_fully_harvested_category(record):
    """Check if the record in `obj.data` has fully harvested categories.

    Arguments:
        record(dict): the ingested article.

    Return:
        bool: True when the record belongs to an arXiv category that is fully
        harvested, otherwise False.
    """
    record_categories = set(
        chain.from_iterable(
            eprint["categories"] for eprint in record.get("arxiv_eprints", [])
        )
    )
    harvested_categories = ARXIV_CATEGORIES
    return (
        len(
            record_categories
            & set(
                harvested_categories.get("core") + harvested_categories.get("non-core")
            )
        )
        > 0
    )


def physics_data_an_is_primary_category(record):
    record_categories = list(
        chain.from_iterable(
            eprint["categories"] for eprint in record.get("arxiv_eprints", [])
        )
    )
    if record_categories:
        return record_categories[0] == "physics.data-an"
    return False
