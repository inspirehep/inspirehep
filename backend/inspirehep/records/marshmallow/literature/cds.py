from inspire_dojson.utils import get_recid_from_ref
from invenio_pidstore.errors import PIDDoesNotExistError
from marshmallow import fields

from inspirehep.records.api import InspireRecord
from inspirehep.records.marshmallow.literature.base import (
    LiteraturePublicSchema,
)


def merge_orcids(author):
    recid = get_recid_from_ref(author.get("record", {}))
    has_orcid = any(aut.get("schema") == "ORCID" for aut in author.get("ids", []))
    if recid and not has_orcid:
        try:
            rec = InspireRecord.get_record_by_pid_value(pid_type="aut", pid_value=recid)
            orcids = [id_ for id_ in rec.get("ids", []) if id_.get("schema") == "ORCID"]
            if orcids:
                if author.get("ids"):
                    author["ids"].extend(orcids)
                else:
                    author["ids"] = orcids
        except PIDDoesNotExistError:
            pass


def collect_ror_ids(author):
    ror_ids = []
    institutions = InspireRecord.get_linked_records_from_dict_field(
        author, "affiliations.record"
    )
    for institution in institutions:
        ror = [
            ins
            for ins in institution.get("external_system_identifiers", [])
            if ins.get("schema") == "ROR"
        ]
        if ror:
            ror_ids.extend(ror)
    return ror_ids


class LiteraturePublicSchemaCDS(LiteraturePublicSchema):
    authors = fields.Method("get_authors")

    @staticmethod
    def get_authors(data):
        updated_authors = []
        for author in data.get("authors", []):
            merge_orcids(author)
            ror_ids = collect_ror_ids(author)
            if ror_ids:
                author["affiliations_identifiers"] = ror_ids

            updated_authors.append(author)

        return updated_authors
