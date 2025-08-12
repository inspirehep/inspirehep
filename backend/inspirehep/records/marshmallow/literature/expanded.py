import orjson
from inspire_utils.record import get_value
from inspirehep.records.marshmallow.literature.base import (
    LiteraturePublicSchema,
)
from inspirehep.records.marshmallow.literature.utils import get_expanded_authors
from marshmallow import fields


class LiteratureExpandedPublicSchema(LiteraturePublicSchema):
    authors = fields.Method("get_authors")

    @staticmethod
    def get_authors(data):
        return get_expanded_authors(data)


class LiteratureExpandedPublicListSchema(LiteraturePublicSchema):
    """Special case for expanded authors display.

    We index a stringified JSON and we have to transform it to JSON again.
    """

    authors = fields.Method("get_expanded_authors_display", dump_only=True)

    def get_expanded_authors_display(self, data):
        try:
            expanded_authors_display = orjson.loads(
                get_value(data, "_expanded_authors_display", "")
            )
            return expanded_authors_display
        except orjson.JSONDecodeError:
            return {}
