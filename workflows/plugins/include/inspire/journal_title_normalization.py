import copy

from inspire_utils.record import get_value


def get_normalized_publication_info(publication_info, normalized_maps):
    journal_title = get_value(publication_info, "journal_title")
    if not journal_title:
        return publication_info

    normalized_title = get_value(normalized_maps, "normalized_journal_titles", []).get(
        journal_title
    )
    normalized_journal_ref = get_value(
        normalized_maps, "normalized_journal_references", []
    ).get(journal_title)

    normalized_publication_info = copy.deepcopy(publication_info)
    normalized_publication_info["journal_title"] = normalized_title
    if normalized_journal_ref:
        normalized_publication_info["journal_record"] = normalized_journal_ref

    return normalized_publication_info
