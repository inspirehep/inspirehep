# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2019 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

"""Disambiguation core ES readers."""
from collections import defaultdict

from elasticsearch_dsl import Q, Search
from elasticsearch_dsl.connections import connections

from inspire_disambiguation import conf
from inspire_disambiguation.core.data_models import Signature
from inspire_disambiguation.core.data_models import PublicationCache


class LiteratureSearch(Search):
    """Simple wrapper for ES Search class which
    simplifies querying on Literature records"""

    connection = connections.create_connection(
        hosts=[conf["ES_HOSTNAME"]], timeout=conf["ES_TIMEOUT"]
    )

    def __init__(self, **kwargs):
        super().__init__(
            using=kwargs.get("using", LiteratureSearch.connection),
            index=kwargs.get("index", "records-hep"),
            doc_type=kwargs.get("doc_type", "hep"),
        )


def get_literature_records_query(signature_block, only_curated):
    """Build query for ES based on provided parameters.

    Args:
        signature_block (str): Signature block for which query should be
            returned. If empty or None returns all of them.
        only_curated (bool): if `True` limit results of query to curated
            records (with `authors.curated_relation` set to `True`).

    Returns:
        Query: Query built for provided parameters.
    """
    SIGNATURE_FIELDS = [
        "abstracts.value",
        "affiliations.value",
        "authors.affiliations.value",
        "authors.curated_relation",
        "authors.full_name",
        "authors.record",
        "authors.signature_block",
        "authors.uuid",
        "control_number",
        "collaborations.value",
        "keywords.value",
        "titles.title",
        "inspire_categories.term",
    ]
    literature_query = Q("match", _collections="Literature")
    partial_authors_query = Q()
    if only_curated:
        partial_authors_query += Q("term", authors__curated_relation=True)
    if signature_block:
        partial_authors_query += Q(
            "term", authors__signature_block__raw=signature_block
        )
    authors_query = Q("nested", path="authors", query=partial_authors_query)
    query = (
        LiteratureSearch()
        .query(Q("bool", must=[literature_query, authors_query]))
        .params(size=conf["ES_MAX_QUERY_SIZE"], _source=SIGNATURE_FIELDS)
    )
    return query


def get_signatures(signature_block=None, only_curated=False):
    """Get all signatures from ES.

    Args:
        signature_block (str, optional): string representation of selected signature
            block. If empty or None returns all signature blocks. Defaults to None.
        only_curated (bool, optional): If set to true return only curated signatures,
            otherwise return all. Defaults to False.

    Returns:
        list: dicts of signatures.

    Example:
        >>> get_signatures("ABDa", True)
        [Signature(...), Signature(...), Signature(...)]
    """
    query = get_literature_records_query(signature_block, only_curated)
    results = []
    for record in query.scan():
        record = record.to_dict()
        for author in record.get("authors"):
            if only_curated and not author.get("curated_relation"):
                continue
            if signature_block and author.get("signature_block") != signature_block:
                continue
            signature = Signature.build(author, record)
            # Skip signatures marked as curated which do not have author_id
            if only_curated and not signature.get("author_id"):
                continue
            results.append(signature)
    PublicationCache.clear()
    return results


def get_input_clusters(signatures):
    """Return input clusters for given signatures.

    Args:
        signatures (iterable): Iterable which contains dicts of signatures
            for which input_clusters should be built.

    Returns:
        list: list of all input clusters for provided signatures.

    Example:
        >>> s1 =Signature.build(signature_data1)
        >>> s2 =Signature.build(signature_data2)
        >>> signatures = get_signatures([s1, s2])
        >>> get_input_clusters(signatures)
        [{'author_id': 1234,
          'cluster_id': 0,
          'signature_uuids': [
            'd83736ab-0672-46ac-9efa-065c685bf26e',
            'cfcd2ea7-d1ce-4d76-a733-b3d1c5e2cb11'
          ]},
          {'author_id

           ]
    """
    input_clusters = []
    signatures_with_author = defaultdict(list)
    signatures_without_author = []
    for signature in signatures:
        if signature.get("is_curated_author_id"):
            signatures_with_author[signature["author_id"]].append(
                signature["signature_uuid"]
            )
        else:
            signatures_without_author.append(signature["signature_uuid"])
    for cluster_id, (author_id, signature_uuids) in enumerate(
        signatures_with_author.items()
    ):
        input_clusters.append(
            {
                "author_id": author_id,
                "cluster_id": cluster_id,
                "signature_uuids": signature_uuids,
            }
        )

    if len(signatures_without_author) > 0:
        input_clusters.append(
            {
                "author_id": None,
                "cluster_id": -1,
                "signature_uuids": signatures_without_author,
            }
        )
    return input_clusters
