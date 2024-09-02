def assign_normalized_affiliations(normalized_affiliations, data):
    for author, normalized_affiliation in zip(
        data.get("authors", []), normalized_affiliations, strict=False
    ):
        author_affiliations = author.get("affiliations", [])
        if author_affiliations:
            continue
        if normalized_affiliation:
            author["affiliations"] = normalized_affiliation
    return data
