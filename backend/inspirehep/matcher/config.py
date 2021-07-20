# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from .validators import authors_validator

GROBID_URL = "https://grobid.inspirebeta.net"

REFERENCE_MATCHER_UNIQUE_IDENTIFIERS_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {
                    "path": "reference.arxiv_eprint",
                    "search_path": "arxiv_eprints.value.raw",
                    "type": "exact",
                },
                {
                    "path": "reference.dois",
                    "search_path": "dois.value.raw",
                    "type": "exact",
                },
                {
                    "path": "reference.isbn",
                    "search_path": "isbns.value.raw",
                    "type": "exact",
                },
            ]
        }
    ],
    "index": "records-hep",
    "collections": ["Literature"],
    "source": ["control_number"],
}

REFERENCE_MATCHER_REPORT_NUMBERS = {
    "algorithm": [
        {
            "queries": [
                {
                    "path": "reference.report_numbers",
                    "search_path": "report_numbers.value.fuzzy",
                    "type": "exact",
                },
            ]
        }
    ],
    "index": "records-hep",
    "collections": ["Literature"],
    "source": ["control_number"],
}

REFERENCE_MATCHER_TEXKEY_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {
                    "path": "reference.texkey",
                    "search_path": "texkeys.raw",
                    "type": "exact",
                }
            ]
        }
    ],
    "index": "records-hep",
    "collections": ["Literature"],
    "source": ["control_number"],
}
"""Configuration for matching all HEP records (including JHEP and JCAP records)
using unique identifiers."""


REFERENCE_MATCHER_DEFAULT_PUBLICATION_INFO_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {
                    "paths": [
                        "reference.publication_info.journal_issue",
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.artid",
                    ],
                    "search_paths": [
                        "publication_info.journal_issue",
                        "publication_info.journal_title.raw",
                        "publication_info.journal_volume",
                        "publication_info.page_artid",
                    ],
                    "type": "nested",
                },
                {
                    "paths": [
                        "reference.publication_info.journal_issue",
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.page_start",
                    ],
                    "search_paths": [
                        "publication_info.journal_issue",
                        "publication_info.journal_title.raw",
                        "publication_info.journal_volume",
                        "publication_info.page_artid",
                    ],
                    "type": "nested",
                },
                {
                    "paths": [
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.artid",
                    ],
                    "search_paths": [
                        "publication_info.journal_title.raw",
                        "publication_info.journal_volume",
                        "publication_info.page_artid",
                    ],
                    "type": "nested",
                },
                {
                    "paths": [
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.page_start",
                    ],
                    "search_paths": [
                        "publication_info.journal_title.raw",
                        "publication_info.journal_volume",
                        "publication_info.page_artid",
                    ],
                    "type": "nested",
                },
            ]
        }
    ],
    "index": "records-hep",
    "collections": ["Literature"],
    "source": ["control_number"],
}
"""Configuration for matching all HEP records using publication_info.
These are separate from the unique queries since these can result in
multiple matches (particularly in the case of errata)."""


REFERENCE_MATCHER_DEFAULT_PUBLICATION_INFO_WITH_PREFIX_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {
                    "paths": [
                        "reference.publication_info.journal_issue",
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.artid",
                    ],
                    "search_paths": [
                        "publication_info.journal_issue",
                        "publication_info.journal_title",
                        "publication_info.journal_volume",
                        "publication_info.page_artid",
                    ],
                    "type": "nested-prefix",
                    "prefix_search_path": "publication_info.journal_title",
                },
                {
                    "paths": [
                        "reference.publication_info.journal_issue",
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.page_start",
                    ],
                    "search_paths": [
                        "publication_info.journal_issue",
                        "publication_info.journal_title",
                        "publication_info.journal_volume",
                        "publication_info.page_artid",
                    ],
                    "type": "nested-prefix",
                    "prefix_search_path": "publication_info.journal_title",
                },
                {
                    "paths": [
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.artid",
                    ],
                    "search_paths": [
                        "publication_info.journal_title",
                        "publication_info.journal_volume",
                        "publication_info.page_artid",
                    ],
                    "type": "nested-prefix",
                    "prefix_search_path": "publication_info.journal_title",
                },
                {
                    "paths": [
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.page_start",
                    ],
                    "search_paths": [
                        "publication_info.journal_title",
                        "publication_info.journal_volume",
                        "publication_info.page_artid",
                    ],
                    "type": "nested-prefix",
                    "prefix_search_path": "publication_info.journal_title",
                },
            ]
        }
    ],
    "index": "records-hep",
    "collections": ["Literature"],
    "source": ["control_number"],
}
"""Configuration for matching all HEP records using publication_info
when journal_title is missing a part name.
These are separate from the unique queries since these can result in
multiple matches (particularly in the case of errata)."""


REFERENCE_MATCHER_JHEP_AND_JCAP_PUBLICATION_INFO_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {
                    "paths": [
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.year",
                        "reference.publication_info.artid",
                    ],
                    "search_paths": [
                        "publication_info.journal_title.raw",
                        "publication_info.journal_volume",
                        "publication_info.year",
                        "publication_info.page_artid",
                    ],
                    "type": "nested",
                },
                {
                    "paths": [
                        "reference.publication_info.journal_title",
                        "reference.publication_info.journal_volume",
                        "reference.publication_info.year",
                        "reference.publication_info.page_start",
                    ],
                    "search_paths": [
                        "publication_info.journal_title.raw",
                        "publication_info.journal_volume",
                        "publication_info.year",
                        "publication_info.page_artid",
                    ],
                    "type": "nested",
                },
            ]
        }
    ],
    "index": "records-hep",
    "collections": ["Literature"],
    "source": ["control_number"],
}
"""Configuration for matching records JCAP and JHEP records using the
publication_info, since we have to look at the year as well for accurate
matching.
These are separate from the unique queries since these can result in
multiple matches (particularly in the case of errata)."""


REFERENCE_MATCHER_DATA_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {
                    "path": "reference.dois",
                    "search_path": "dois.value.raw",
                    "type": "exact",
                }
            ]
        }
    ],
    "index": "records-data",
    "source": ["control_number"],
}

AUTHOR_MATCHER_EXACT_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {"path": "ids.value", "search_path": "ids.value", "type": "exact"},
            ],
            "validator": authors_validator,
        },
        {
            "queries": [
                {
                    "path": "emails",
                    "search_path": "email_addresses.value",
                    "type": "exact",
                },
            ],
        },
    ],
    "index": "records-authors",
    "source": ["self.$ref", "ids"],
}

AUTHOR_MATCHER_NAME_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {
                    "paths": ["first_name", "last_name"],
                    "search_paths": ["authors.first_name", "authors.last_name"],
                    "type": "nested",
                    "inner_hits": {
                        "_source": [
                            "authors.record.$ref",
                            "authors.affiliations.value",
                            "authors.ids",
                        ]
                    },
                },
            ],
        },
    ],
    "index": "records-hep",
    "source": ["control_number", "collaborations.value"],
}


AUTHOR_MATCHER_NAME_INITIALS_CONFIG = {
    "algorithm": [
        {
            "queries": [
                {
                    "type": "author-names",
                    "inner_hits": {"_source": ["authors.record", "authors.ids"]},
                },
            ]
        },
    ],
    "index": "records-hep",
    "source": ["control_number", "authors.full_name", "authors.record.$ref"],
}
