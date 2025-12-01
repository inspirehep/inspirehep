import orjson
from inspire_utils.record import get_value
from inspirehep.records.marshmallow.common.accelerator_experiment import (
    AcceleratorExperimentExpandedSchemaV1,
)
from inspirehep.records.marshmallow.literature.base import (
    LiteraturePublicSchema,
)
from inspirehep.records.marshmallow.literature.utils import (
    get_documents_without_error_field,
    get_expanded_authors,
)
from marshmallow import fields


def get_documents_with_arxiv(data):
    """Get documents including synthetic arXiv documents.

    For each arxiv_eprints entry, create a synthetic document pointing
    directly to arXiv PDF.
    """
    result_documents = get_documents_without_error_field(data)

    arxiv_eprints = get_value(data, "arxiv_eprints.value", [])
    for arxiv_value in arxiv_eprints:
        synthetic_doc = {
            "filename": f"{arxiv_value}.pdf",
            "fulltext": True,
            "material": "preprint",
            "source": "arxiv",
            "url": f"https://arxiv.org/pdf/{arxiv_value}",
        }
        result_documents.append(synthetic_doc)

    return result_documents


class LiteratureExpandedPublicSchema(LiteraturePublicSchema):
    authors = fields.Method("get_authors")
    documents = fields.Method("get_documents", dump_only=True)
    accelerator_experiments = fields.Nested(
        AcceleratorExperimentExpandedSchemaV1, dump_only=True, many=True
    )

    @staticmethod
    def get_authors(data):
        return get_expanded_authors(data)

    @staticmethod
    def get_documents(data):
        return get_documents_with_arxiv(data)


class LiteratureExpandedPublicListSchema(LiteraturePublicSchema):
    """Special case for expanded authors display.

    We index a stringified JSON and we have to transform it to JSON again.
    """

    authors = fields.Method("get_expanded_authors_display", dump_only=True)
    documents = fields.Method("get_documents", dump_only=True)
    accelerator_experiments = fields.Nested(
        AcceleratorExperimentExpandedSchemaV1, dump_only=True, many=True
    )

    def get_expanded_authors_display(self, data):
        try:
            expanded_authors_display = orjson.loads(
                get_value(data, "_expanded_authors_display", "")
            )
            return expanded_authors_display
        except orjson.JSONDecodeError:
            return {}

    @staticmethod
    def get_documents(data):
        return get_documents_with_arxiv(data)
