def process_entries(
    entries,
    title_getter,
    normalized_titles_map,
    normalized_references_map,
    normalized_categories_map,
    workflow_data,
):
    """Normalize journal titles and enrich with DB info."""
    for entry in entries:
        journal_title = title_getter(entry)
        if not journal_title:
            continue
        normalized_title = normalized_titles_map.get(journal_title)
        journal_ref = normalized_references_map.get(journal_title)
        journal_inspire_categories = normalized_categories_map.get(journal_title)
        entry["journal_title"] = normalized_title
        if journal_ref:
            entry["journal_record"] = journal_ref
        if journal_inspire_categories:
            workflow_data.setdefault("journal_inspire_categories", []).extend(
                journal_inspire_categories
            )
