import datetime

import structlog
from flask import url_for
from inspire_dojson.utils import get_record_ref

from inspirehep.records.api.authors import AuthorsRecord
from inspirehep.records.api.literature import LiteratureRecord

LOGGER = structlog.getLogger()


def link_signature_to_author(signature_data, author_control_number):
    """Adds record/$ref of the given author to the given signature.

    Args:
        author_control_number (int): The control number of the author to which we want to link.
        signature_data (list): List containing 2 elements: the publication_id and the signature uuid.

    Returns:
        dict: The signature data from the publication with the linked author.
    """
    record = LiteratureRecord.get_record_by_pid_value(signature_data["publication_id"])
    signature = next(
        (
            author
            for author in record.get("authors")
            if author.get("uuid") == signature_data["signature_uuid"]
        ),
        None,
    )
    if not signature:
        return None
    if signature.get(
        "curated_relation"
    ) and not LiteratureRecord.get_linked_records_from_dict_field(signature, "record"):
        signature["curated_relation"] = False
    signature["record"] = get_record_ref(author_control_number, "authors")
    record.update(dict(record))
    return signature


def link_signatures_to_author(signatures_data, author_control_number):
    """Adds record/$ref of the given author to the given signatures.

    Args:
        author_control_number (int): The control number of the author to which we want to link.
        signatures_data (list): List of signatures data.

    Returns:
        list: list of full signature data with the linked author.
    """
    linked_signatures = (
        link_signature_to_author(signature_data, author_control_number)
        for signature_data in signatures_data
    )
    return [signature for signature in linked_signatures if signature is not None]


def create_new_empty_author():
    """Create a stub author record."""
    author_data = {
        "name": {"value": "BEARD STUB"},
        "_collections": ["Authors"],
        "stub": True,
        "acquisition_source": {
            "method": "beard",
            "datetime": datetime.datetime.utcnow().isoformat(),
        },
        "$schema": url_for(
            "invenio_jsonschemas.get_schema",
            schema_path="records/authors.json",
            _external=True,
        ),
    }
    author = AuthorsRecord.create(author_data)
    return author


def update_author_names(author, signatures):
    """Updates the given author with the names from the given signatures.
    Sets the value to the longest name from the signatures and the
    name_variants will be a list of the names from all the signatures.s

    Args:
        author (dict): The author to be updated.
        signatures (list): List of signatures data.
    """
    name_variants = {signature["full_name"] for signature in signatures}
    name_variants = sorted(name_variants, reverse=True, key=len)
    author["name"]["value"] = name_variants.pop(0)
    if name_variants:
        author["name"]["name_variants"] = name_variants
    author.update(dict(author))
    return author
