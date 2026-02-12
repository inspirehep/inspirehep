from django.conf import settings
from django_opensearch_dsl.registries import registry
from django_opensearch_dsl import fields

from backoffice.hep.models import HepWorkflow
from backoffice.common.documents import BaseWorkflowDocument


@registry.register_document
class HepWorkflowDocument(BaseWorkflowDocument):
    data = fields.ObjectField(
        dynamic=False,
        properties={
            "acquisition_source": fields.ObjectField(
                properties={
                    "datetime": fields.DateField(),
                    "method": fields.KeywordField(),
                    "source": fields.KeywordField(),
                }
            ),
            "arxiv_eprints": fields.ObjectField(
                properties={
                    "categories": fields.KeywordField(),
                    "value": fields.KeywordField(
                        fields={
                            "raw": fields.KeywordField(normalizer="lowercase"),
                        }
                    ),
                }
            ),
            "abstracts": fields.ObjectField(
                properties={
                    "source": fields.KeywordField(),
                    "value": fields.TextField(),
                }
            ),
            "control_number": fields.IntegerField(),
            "core": fields.BooleanField(),
            "dois": fields.ObjectField(
                properties={
                    "material": fields.KeywordField(),
                    "source": fields.KeywordField(),
                    "value": fields.KeywordField(
                        fields={
                            "raw": fields.KeywordField(normalizer="lowercase"),
                        }
                    ),
                }
            ),
            "accelerator_experiments": fields.ObjectField(
                properties={
                    "legacy_name": fields.TextField(),
                }
            ),
            "corporate_author": fields.TextField(),
            "authors": fields.ObjectField(
                properties={
                    "full_name": fields.TextField(),
                    "affiliations": fields.ObjectField(
                        properties={
                            "value": fields.KeywordField(
                                normalizer="lowercase",
                                fields={"raw": fields.KeywordField()},
                            )
                        }
                    ),
                }
            ),
            "public_notes": fields.ObjectField(
                properties={
                    "source": fields.KeywordField(),
                    "value": fields.TextField(),
                }
            ),
            "collaborations": fields.ObjectField(
                properties={
                    "value": fields.TextField(),
                }
            ),
            "external_system_identifiers": fields.ObjectField(
                properties={
                    "schema": fields.KeywordField(normalizer="lowercase"),
                    "value": fields.TextField(
                        fields={"raw": fields.KeywordField()},
                    ),
                }
            ),
            "_private_notes": fields.ObjectField(
                properties={
                    "source": fields.KeywordField(),
                    "value": fields.TextField(),
                }
            ),
            "publication_info": fields.ObjectField(
                properties={
                    "journal_issue": fields.KeywordField(),
                    "journal_title": fields.TextField(
                        fields={"raw": fields.KeywordField()}
                    ),
                    "journal_volume": fields.TextField(),
                }
            ),
            "report_numbers": fields.ObjectField(
                properties={
                    "hidden": fields.BooleanField(),
                    "source": fields.KeywordField(),
                    "value": fields.TextField(
                        fields={
                            "fuzzy": fields.TextField(analyzer="report_number"),
                            "raw": fields.KeywordField(),
                        }
                    ),
                }
            ),
            "supervisors": fields.NestedField(
                properties={
                    "affiliations": fields.ObjectField(
                        properties={
                            "value": fields.KeywordField(
                                normalizer="lowercase",
                                fields={"raw": fields.KeywordField()},
                            ),
                        }
                    ),
                    "raw_affiliations": fields.ObjectField(
                        properties={
                            "source": fields.KeywordField(),
                            "value": fields.TextField(),
                        }
                    ),
                }
            ),
            "titles": fields.ObjectField(
                properties={
                    "full_title": fields.TextField(
                        analyzer="title",
                        fields={
                            "keyword": fields.KeywordField(),
                            "search": fields.TextField(
                                analyzer="title_whitespace_tokenized"
                            ),
                        },
                    ),
                    "source": fields.KeywordField(),
                    "subtitle": fields.TextField(copy_to=["data.titles.full_title"]),
                    "title": fields.TextField(copy_to=["data.titles.full_title"]),
                }
            ),
            "inspire_categories": fields.ObjectField(
                properties={
                    "term": fields.KeywordField(),
                }
            ),
        },
    )
    relevance_prediction = fields.ObjectField(enabled=False)
    matches = fields.ObjectField(enabled=False)

    class Index(BaseWorkflowDocument.Index):
        name = settings.OPENSEARCH_INDEX_NAMES.get(settings.HEP_DOCUMENTS)
        settings = {
            **BaseWorkflowDocument.Index.settings,
            "analysis": {
                "analyzer": {
                    "title_whitespace_tokenized": {
                        "char_filter": ["tex_normalizer"],
                        "filter": ["lowercase", "ascii_filter"],
                        "tokenizer": "whitespace",
                        "type": "custom",
                    },
                    "title": {
                        "char_filter": ["tex_normalizer"],
                        "filter": ["lowercase", "ascii_filter"],
                        "tokenizer": "icu_tokenizer",
                        "type": "custom",
                    },
                    "report_number": {
                        "char_filter": ["alphanumeric_normalizer"],
                        "filter": ["lowercase"],
                        "tokenizer": "keyword",
                        "type": "custom",
                    },
                },
                "char_filter": {
                    "alphanumeric_normalizer": {
                        "pattern": "[^A-Za-z0-9]",
                        "replacement": "",
                        "type": "pattern_replace",
                    },
                    "tex_normalizer": {
                        "pattern": "\\$[^$]+\\$",
                        "replacement": "",
                        "type": "pattern_replace",
                    },
                },
                "filter": {
                    "ascii_filter": {
                        "preserve_original": True,
                        "type": "asciifolding",
                    },
                    "lowercase": {
                        "type": "lowercase",
                    },
                },
                "normalizer": {
                    "lowercase": {
                        "type": "custom",
                        "filter": ["lowercase"],
                    }
                },
            },
        }

    class Django(BaseWorkflowDocument.Django):
        model = HepWorkflow
