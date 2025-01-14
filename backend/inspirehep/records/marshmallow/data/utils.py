from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.record import get_value

from inspirehep.records.marshmallow.literature.common.author import AuthorSchemaV1
from inspirehep.search.api import LiteratureSearch


def get_authors(data):
    schema = AuthorSchemaV1(many=True)
    authors = data.get("authors", [])
    if authors:
        return schema.dump(authors).data

    literature = get_value(data, "literature")
    if not literature:
        return schema.dump(authors).data

    control_number = get_recid_from_ref(get_value(literature[0], "record"))
    if not control_number:
        return schema.dump(authors).data

    literature_record = LiteratureSearch.get_records_by_pids(
        [("lit", control_number)], source="authors"
    )
    if not literature_record:
        return schema.dump(authors).data

    linked_authors = literature_record[0].to_dict().get("authors", [])
    return schema.dump(linked_authors).data
