# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


def hep_earliest_date_aggregation(order, title="Papers per year", agg_type="range"):
    return {
        "earliest_date": {
            "date_histogram": {
                "field": "earliest_date",
                "interval": "year",
                "format": "yyyy",
                "min_doc_count": 1,
            },
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def hep_doc_type_aggregation(order, title="Document Type", agg_type="checkbox"):
    return {
        "doc_type": {
            "terms": {"field": "facet_inspire_doc_type", "size": 20},
            "meta": {
                "title": title,
                "order": order,
                "type": agg_type,
                "bucket_help": {
                    "published": {
                        "text": "Published papers are believed to have undergone rigorous peer review.",
                        "link": "https://inspirehep.net/help/knowledge-base/faq/#faq-published",
                    }
                },
            },
        }
    }


def hep_author_count_aggregation(order, title="Number of authors", agg_type="checkbox"):
    return {
        "author_count": {
            "range": {
                "field": "author_count",
                "ranges": [
                    {"key": "Single author", "from": 1, "to": 2},
                    {"key": "10 authors or less", "from": 1, "to": 11},
                ],
            },
            "meta": {"title": title, "order": order, "type": agg_type},
            "aggs": {
                "doc_count_bucket_filter": {
                    "bucket_selector": {
                        "buckets_path": {"count": "_count"},
                        "script": "params.count > 0",
                    }
                }
            },
        }
    }


def hep_collaboration_aggregation(order, title="Collaboration", agg_type="checkbox"):
    return {
        "collaboration": {
            "terms": {"field": "facet_collaborations", "size": 20},
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def hep_author_aggregation(order, author=None, title="Author", agg_type="checkbox"):
    aggregation = {
        "author": {
            "terms": {"field": "facet_author_name", "size": 100},
            "meta": {"title": title, "order": order, "type": agg_type, "split": True},
        }
    }
    if author:
        aggregation["author"]["terms"]["exclude"] = author
    return aggregation


def hep_subject_aggregation(order, title="Subject", agg_type="checkbox"):
    return {
        "subject": {
            "terms": {"field": "facet_inspire_categories", "size": 20},
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def hep_arxiv_categories_aggregation(
    order, title="arXiv Category", agg_type="checkbox"
):
    return {
        "arxiv_categories": {
            "terms": {"field": "facet_arxiv_categories", "size": 20},
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def jobs_field_of_interest_aggregation(
    order, title="Field of Interest", agg_type="multiselect"
):
    return {
        "field_of_interest": {
            "terms": {"field": "arxiv_categories", "missing": "Other", "size": 500},
            "meta": {"order": order, "type": agg_type, "title": title},
        }
    }


def jobs_rank_aggregation(order, title="Rank", agg_type="multiselect"):
    return {
        "rank": {
            "terms": {"field": "ranks"},
            "meta": {"order": order, "type": agg_type, "title": title},
        }
    }


def jobs_region_aggregation(order, title="Region", agg_type="multiselect"):
    return {
        "region": {
            "terms": {"field": "regions"},
            "meta": {"order": order, "type": agg_type, "title": title},
        }
    }


def jobs_status_aggregation(order, title="Status", agg_type="multiselect"):
    return {
        "status": {
            "terms": {"field": "status"},
            "meta": {"order": order, "type": agg_type, "title": title},
        }
    }


def conf_series_aggregation(order, title="Series", agg_type="checkbox"):
    return {
        "series": {
            "terms": {"field": "series.name.raw", "size": 20},
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def conf_subject_aggregation(order, title="Subject", agg_type="checkbox"):
    return {
        "subject": {
            "terms": {"field": "inspire_categories.term", "size": 20},
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def hep_self_author_affiliations_aggregation(
    order, author_recid, title="Affiliations", agg_type="checkbox"
):
    return {
        "self_affiliations": {
            "nested": {"path": "authors"},
            "aggs": {
                "nested_agg": {
                    "filter": {"term": {"authors.record.$ref": author_recid}},
                    "aggs": {
                        "self_affiliations": {
                            "terms": {
                                "field": "authors.affiliations.value.raw",
                                "size": 20,
                            },
                            "meta": {"title": title, "order": order, "type": agg_type},
                        }
                    },
                }
            },
        }
    }


def hep_author_affiliations_aggregation(
    order, title="Affiliations", agg_type="checkbox"
):
    return {
        "affiliations": {
            "nested": {"path": "authors"},
            "aggs": {
                "affiliations": {
                    "terms": {"field": "authors.affiliations.value.raw", "size": 20},
                    "meta": {"title": title, "order": order, "type": agg_type},
                    "aggs": {"affiliations": {"reverse_nested": {}}},
                }
            },
        }
    }


def hep_self_author_names_aggregation(
    order, author_recid, title="Name variations", agg_type="checkbox"
):
    return {
        "self_author_names": {
            "nested": {"path": "authors"},
            "aggs": {
                "nested_agg": {
                    "filter": {"term": {"authors.record.$ref": author_recid}},
                    "aggs": {
                        "self_author_names": {
                            "terms": {"field": "authors.full_name.raw", "size": 20},
                            "meta": {"title": title, "order": order, "type": agg_type},
                        }
                    },
                }
            },
        }
    }


def hep_collection_aggregation(order, title="Collection", agg_type="checkbox"):
    return {
        "collection": {
            "terms": {"field": "_collections", "size": 20},
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def hep_rpp(order, title="Exclude RPP", agg_type="checkbox"):
    return {
        "rpp": {
            "filters": {
                "filters": {
                    "Exclude Review of Particle Physics": {
                        "bool": {
                            "must_not": [
                                {
                                    "match": {
                                        "titles.full_title": {
                                            "query": "RPP",
                                            "operator": "and",
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            "meta": {
                "title": title,
                "order": order,
                "type": agg_type,
                "is_filter_aggregation": True,
            },
        }
    }


def hep_self_author_claimed_papers_aggregation(
    order, author_recid, title="Claims", agg_type="checkbox"
):
    return {
        "self_curated_relation": {
            "filters": {
                "filters": {
                    "Claimed papers": {
                        "nested": {
                            "path": "authors",
                            "query": {
                                "bool": {
                                    "must": [
                                        {"term": {"authors.curated_relation": True}},
                                        {"term": {"authors.record.$ref": author_recid}},
                                    ]
                                }
                            },
                        }
                    },
                    "Unclaimed papers": {
                        "nested": {
                            "path": "authors",
                            "query": {
                                "bool": {
                                    "must_not": [
                                        {"term": {"authors.curated_relation": True}}
                                    ],
                                    "must": [
                                        {"term": {"authors.record.$ref": author_recid}}
                                    ],
                                }
                            },
                        }
                    },
                },
                "meta": {
                    "title": title,
                    "order": order,
                    "type": agg_type,
                    "is_filter_aggregation": True,
                },
            }
        }
    }


def seminar_subject_aggregation(order, title="Subject", agg_type="checkbox"):
    return {
        "subject": {
            "terms": {"field": "inspire_categories.term", "size": 20},
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def seminar_series_aggregation(order, title="Series", agg_type="checkbox"):
    return {
        "series": {
            "terms": {"field": "series.name.raw", "size": 20},
            "meta": {"title": title, "order": order, "type": agg_type},
        }
    }


def seminar_accessibility_aggregation(
    order, title="Accessibility", agg_type="checkbox"
):
    return {
        "accessibility": {
            "filters": {
                "filters": {
                    "Has material": {"exists": {"field": "material_urls"}},
                    "Has captions": {"term": {"captioned": True}},
                }
            },
            "meta": {
                "title": title,
                "order": order,
                "type": agg_type,
                "is_filter_aggregation": True,
            },
        }
    }


def experiment_inspire_classification_aggregation(
    order, title="Classification", agg_type="tree"
):
    return {
        "classification": {
            "terms": {"field": "inspire_classification", "size": 500},
            "meta": {
                "title": title,
                "order": order,
                "type": agg_type,
                "split_tree_by": "|",
            },
        }
    }


def experiment_institution_aggregation(order):
    return {
        "institution": {
            "terms": {"field": "institutions.value", "size": 20},
            "meta": {"title": "Institution", "order": order, "type": "checkbox"},
        }
    }
