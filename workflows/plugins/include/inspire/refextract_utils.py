import logging
import unicodedata

from inspire_schemas.api import ReferenceBuilder
from inspire_utils.dedupers import dedupe_list_of_dicts
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value
from refextract import extract_references_from_file, extract_references_from_string
from refextract.references.errors import UnknownDocumentTypeError

logger = logging.getLogger(__name__)


def map_refextract_to_schema(extracted_references, source=None):
    """Convert refextract output to the schema using the builder."""
    result = []
    for reference in extracted_references:
        result.extend(map_refextract_reference_to_schema(reference, source))
    return result


def map_refextract_reference_to_schema(extracted_reference, source=None):
    """Convert refextract output to the schema using the builder."""

    rb = ReferenceBuilder()
    mapping = [
        ("author", rb.add_refextract_authors_str),
        ("collaboration", rb.add_collaboration),
        ("doi", rb.add_uid),
        ("hdl", rb.add_uid),
        ("isbn", rb.add_uid),
        ("journal_reference", rb.set_pubnote),
        ("linemarker", rb.set_label),
        ("misc", rb.add_misc),
        ("publisher", rb.set_publisher),
        ("raw_ref", lambda raw_ref: rb.add_raw_reference(raw_ref, source=source)),
        ("reportnumber", rb.add_report_number),
        ("texkey", rb.set_texkey),
        ("title", rb.add_title),
        ("url", rb.add_url),
        ("year", rb.set_year),
    ]

    for field, method in mapping:
        for el in force_list(extracted_reference.get(field)):
            if el:
                method(el)

    if get_value(rb.obj, "reference.urls"):
        rb.obj["reference"]["urls"] = dedupe_list_of_dicts(rb.obj["reference"]["urls"])

    result = [rb.obj]
    result.extend(rb.pop_additional_pubnotes())

    return result


def raw_refs_to_list(references):
    """Convert raw references into a list of texts to be extracted by refextract.

    Args:
        references list: list a schema-compliant dicts, element of the ``references``
            field. If it already contains a structured reference (that is, a
            ``reference`` key), no further processing is done.  Otherwise, the
            contents of the ``raw_refs`` is extracted by ``refextract``.

    Returns:
        List[dict]: a list of text string to be extracted by refextract.
    """
    normalized_references = []
    raw_references = {"values": [], "sources": []}

    for reference in references:
        if "reference" in reference or "raw_refs" not in reference:
            normalized_references.append(reference)
            continue

        text_raw_refs = [
            ref for ref in reference["raw_refs"] if ref["schema"] == "text"
        ]
        nontext_schemas = [
            ref["schema"] for ref in reference["raw_refs"] if ref["schema"] != "text"
        ]

        if nontext_schemas:
            logger.error(
                "Impossible to extract references from non-text raw_refs "
                "with schemas %s",
                nontext_schemas,
            )
            normalized_references.append(reference)
            continue

        if len(text_raw_refs) > 1:
            logger.error(
                "More than one text raw reference in %s, taking first one,"
                " the others will be lost",
                text_raw_refs,
            )

        raw_references["values"].append(text_raw_refs[0]["value"])
        raw_references["sources"].append(text_raw_refs[0].get("source"))

    return raw_references, normalized_references


def extract_references_from_pdf(filepath, source=None, custom_kbs_file=None):
    """Extract references from PDF and return in INSPIRE format."""
    try:
        extracted_references = extract_references_from_file(
            filepath,
            override_kbs_files=custom_kbs_file,
            reference_format="{title},{volume},{page}",
        )
    except UnknownDocumentTypeError as e:
        if "xml" in str(e):
            logger.info("Skipping extracting references for xml file")
            return []
        raise

    return map_refextract_to_schema(extracted_references, source=source)


def sanitize_references(references):
    """Remove references containing invalid raw_refs."""
    sanitized_references = []

    for reference in references:
        for raw_ref in reference.get("raw_refs", []):
            has_invalid = any(
                unicodedata.category(c).startswith("C")
                for c in raw_ref.get("value", "")
            )

        if not has_invalid:
            sanitized_references.append(reference)

    return sanitized_references


def extract_references_from_text(text, source=None, custom_kbs_file=None):
    """Extract references from text and return in INSPIRE format."""
    extracted_references = extract_references_from_string(
        text,
        override_kbs_files=custom_kbs_file,
        reference_format="{title},{volume},{page}",
    )

    return map_refextract_to_schema(extracted_references, source=source)


def match_references_hep(references, inspire_http_hook):
    response = inspire_http_hook.call_api(
        endpoint="api/matcher/linked_references/",
        method="POST",
        json={"references": references},
    )
    response.raise_for_status()

    return response.json().get("references", [])
