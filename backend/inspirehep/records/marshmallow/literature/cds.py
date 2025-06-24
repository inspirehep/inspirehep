from inspire_dojson.utils import get_recid_from_ref
from marshmallow import fields

from inspirehep.records.api import InspireRecord
from inspirehep.records.marshmallow.literature.base import (
    LiteraturePublicSchema,
)


def merge_orcids(author, resolved_authors_by_id):
    recid = get_recid_from_ref(author.get("record", {}))
    has_orcid = any(
        author_id.get("schema") == "ORCID" for author_id in author.get("ids", [])
    )
    if not recid or has_orcid:
        return

    author_record = resolved_authors_by_id.get(recid)
    if not author_record:
        return

    orcids = [
        id_ for id_ in author_record.get("ids", []) if id_.get("schema") == "ORCID"
    ]
    if orcids:
        if author.get("ids"):
            author["ids"].extend(orcids)
        else:
            author["ids"] = orcids


def merge_affiliation_identifiers(author, resolved_institutions_by_id):
    has_ror = any(
        aff_id.get("schema") == "ROR"
        for aff_id in author.get("affiliations_identifiers", [])
    )
    if has_ror:
        return

    ror_ids = []
    institutions_linked_pids = InspireRecord._get_linked_pids_from_field(
        author, "affiliations.record"
    )
    for _, recid in institutions_linked_pids:
        institution_record = resolved_institutions_by_id.get(recid)
        if not institution_record:
            continue

        rors = [
            identifier
            for identifier in institution_record.get("external_system_identifiers", [])
            if identifier.get("schema") == "ROR"
        ]
        ror_ids.extend(rors)

    if ror_ids:
        if author.get("affiliations_identifiers"):
            author["affiliations_identifiers"].extend(ror_ids)
        else:
            author["affiliations_identifiers"] = ror_ids


class LiteraturePublicSchemaCDS(LiteraturePublicSchema):
    authors = fields.Method("get_authors")

    @staticmethod
    def get_authors(data):
        updated_authors = []
        author_records = InspireRecord.get_linked_records_from_dict_field(
            data, "authors.record"
        )
        institution_records = InspireRecord.get_linked_records_from_dict_field(
            data, "authors.affiliations.record"
        )
        resolved_authors_by_id = {
            record["control_number"]: record for record in author_records
        }
        resolved_institutions_by_id = {
            str(record["control_number"]): record for record in institution_records
        }
        for author in data.get("authors", []):
            merge_orcids(author, resolved_authors_by_id)
            merge_affiliation_identifiers(author, resolved_institutions_by_id)
            updated_authors.append(author)

        return updated_authors
