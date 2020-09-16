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
from operator import itemgetter

from mock import patch

from inspire_disambiguation.core.es.readers import get_signatures, get_input_clusters
from inspire_disambiguation.core.data_models.publication import (
    Publication,
    PublicationCache,
)
from inspire_disambiguation.core.data_models.signature import Signature


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_get_signatures_for_all(
    scan_mock,
    es_record_with_2_curated_authors,
    es_record_with_curated_author_and_no_recid,
    es_record_with_non_curated_author,
):
    scan_mock.side_effect = [
        [
            es_record_with_2_curated_authors,
            es_record_with_curated_author_and_no_recid,
            es_record_with_non_curated_author,
        ]
    ]
    signatures = get_signatures()
    expected_signatures = [
        Signature(
            author_affiliation="Rutgers U., Piscataway",
            author_id=989440,
            author_name="Seiberg, N.",
            publication=Publication(
                abstract="2 curated authors with recid",
                authors=["Seiberg, N.", "Jimmy"],
                collaborations=[],
                keywords=["effective action", "approximation: semiclassical"],
                publication_id=374836,
                title="Title",
                topics=["Theory-HEP"],
            ),
            signature_block="SABARGn",
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
            is_curated_author_id=True,
        ),
        Signature(
            author_affiliation="UAIC",
            author_id=989440,
            author_name="Jimmy",
            publication=Publication(
                abstract="2 curated authors with recid",
                authors=["Seiberg, N.", "Jimmy"],
                collaborations=[],
                keywords=["effective action", "approximation: semiclassical"],
                publication_id=374836,
                title="Title",
                topics=["Theory-HEP"],
            ),
            signature_block="JANa",
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e55",
            is_curated_author_id=True,
        ),
        Signature(
            author_affiliation="Texas U.",
            author_id=None,
            author_name="Weinberg, Steven",
            publication=Publication(
                abstract="Author not curated",
                authors=["Weinberg, Steven"],
                collaborations=[],
                keywords=["book"],
                publication_id=406190,
                title="The Quantum theory of fields. Vol. 1: Foundations",
                topics=["Theory-HEP", "General Physics"],
            ),
            signature_block="WANBARGs",
            signature_uuid="5e550ded-e955-4a22-b906-8af5aaa9f1e2",
            is_curated_author_id=False,
        ),
        Signature(
            author_affiliation="Rutgers U., Piscataway",
            author_id=989443,
            author_name="Seiberg, Nana.",
            publication=Publication(
                abstract="Author curated no recid",
                authors=["Seiberg, Nana."],
                collaborations=[],
                keywords=["thesis", "string model"],
                publication_id=421404,
                title="Black holes in string theory",
                topics=["Theory-HEP"],
            ),
            signature_block="SABARGn",
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e51",
            is_curated_author_id=False,
        ),
    ]
    assert sorted(signatures, key=itemgetter("signature_uuid")) == sorted(
        expected_signatures, key=itemgetter("signature_uuid")
    )


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_get_signatures_for_signature_block(
    scan_mock, es_record_with_2_curated_authors
):
    scan_mock.side_effect = [[es_record_with_2_curated_authors]]
    signatures = get_signatures(signature_block="JANa")
    expected_signatures = [
        Signature(
            author_affiliation="UAIC",
            author_id=989440,
            author_name="Jimmy",
            publication=Publication(
                abstract="2 curated authors with recid",
                authors=["Seiberg, N.", "Jimmy"],
                collaborations=[],
                keywords=["effective action", "approximation: semiclassical"],
                publication_id=374836,
                title="Title",
                topics=["Theory-HEP"],
            ),
            signature_block="JANa",
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e55",
            is_curated_author_id=True,
        )
    ]

    assert sorted(signatures, key=itemgetter("signature_uuid")) == sorted(
        expected_signatures, key=itemgetter("signature_uuid")
    )


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_get_signatures_for_signature_block_only_curated(
    scan_mock, es_record_with_2_curated_authors, es_record_with_non_curated_author
):
    scan_mock.side_effect = [
        [es_record_with_2_curated_authors, es_record_with_non_curated_author]
    ]
    signatures = get_signatures(signature_block="SABARGn", only_curated=True)
    expected_signatures = [
        Signature(
            author_affiliation="Rutgers U., Piscataway",
            author_id=989440,
            author_name="Seiberg, N.",
            publication=Publication(
                abstract="2 curated authors with recid",
                authors=["Seiberg, N.", "Jimmy"],
                collaborations=[],
                keywords=["effective action", "approximation: semiclassical"],
                publication_id=374836,
                title="Title",
                topics=["Theory-HEP"],
            ),
            signature_block="SABARGn",
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
            is_curated_author_id=True,
        )
    ]

    assert sorted(signatures, key=itemgetter("signature_uuid")) == sorted(
        expected_signatures, key=itemgetter("signature_uuid")
    )


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_get_signatures_only_curated(
    scan_mock,
    es_record_with_2_curated_authors,
    es_record_with_curated_author_and_no_recid,
    es_record_with_non_curated_author,
):
    scan_mock.side_effect = [
        [
            es_record_with_2_curated_authors,
            es_record_with_curated_author_and_no_recid,
            es_record_with_non_curated_author,
        ]
    ]
    signatures = get_signatures(only_curated=True)
    expected_signatures = [
        Signature(
            author_affiliation="Rutgers U., Piscataway",
            author_id=989440,
            author_name="Seiberg, N.",
            publication=Publication(
                abstract="2 curated authors with recid",
                authors=["Seiberg, N.", "Jimmy"],
                collaborations=[],
                keywords=["effective action", "approximation: semiclassical"],
                publication_id=374836,
                title="Title",
                topics=["Theory-HEP"],
            ),
            signature_block="SABARGn",
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
            is_curated_author_id=True,
        ),
        Signature(
            author_affiliation="UAIC",
            author_id=989440,
            author_name="Jimmy",
            publication=Publication(
                abstract="2 curated authors with recid",
                authors=["Seiberg, N.", "Jimmy"],
                collaborations=[],
                keywords=["effective action", "approximation: semiclassical"],
                publication_id=374836,
                title="Title",
                topics=["Theory-HEP"],
            ),
            signature_block="JANa",
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e55",
            is_curated_author_id=True,
        ),
    ]

    assert sorted(signatures, key=itemgetter("signature_uuid")) == sorted(
        expected_signatures, key=itemgetter("signature_uuid")
    )


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_publication_cache_invalidated_after_get_signatures(
    scan_mock, es_record_with_2_curated_authors
):
    scan_mock.side_effect = [[es_record_with_2_curated_authors]]
    get_signatures(only_curated=True)

    assert PublicationCache.cache == {}


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_get_input_clusters_for_signatures_with_same_author_id(
    scan_mock, es_record_with_2_curated_authors
):
    scan_mock.side_effect = [[es_record_with_2_curated_authors]]
    signatures = get_signatures()
    clusters = get_input_clusters(signatures)

    expected_clusters = [
        {
            "author_id": 989440,
            "cluster_id": 0,
            "signature_uuids": [
                "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
                "94fc2b0a-dc17-42c2-bae3-ca0024079e55",
            ],
        }
    ]
    assert clusters == expected_clusters


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_get_input_clusters_for_signatures_with_different_author_id(
    scan_mock, es_record_with_2_curated_authors, es_record_with_curated_author
):
    scan_mock.side_effect = [
        [es_record_with_2_curated_authors, es_record_with_curated_author]
    ]
    signatures = get_signatures()
    clusters = get_input_clusters(signatures)

    expected_clusters = [
        {
            "author_id": 989440,
            "cluster_id": 0,
            "signature_uuids": [
                "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
                "94fc2b0a-dc17-42c2-bae3-ca0024079e55",
            ],
        },
        {
            "author_id": 989441,
            "cluster_id": 1,
            "signature_uuids": ["94fc2b0a-dc17-42c2-bae3-ca0024079e52"],
        },
    ]
    assert clusters == expected_clusters


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_get_input_clusters_for_non_curated_and_curated_signatures(
    scan_mock, es_record_with_non_curated_author, es_record_with_curated_author
):
    scan_mock.side_effect = [
        [es_record_with_non_curated_author, es_record_with_curated_author]
    ]
    signatures = get_signatures()
    clusters = get_input_clusters(signatures)

    expected_clusters = [
        {
            "author_id": 989441,
            "cluster_id": 0,
            "signature_uuids": ["94fc2b0a-dc17-42c2-bae3-ca0024079e52"],
        },
        {
            "author_id": None,
            "cluster_id": -1,
            "signature_uuids": ["94fc2b0a-dc17-42c2-bae3-ca0024079e51"],
        },
    ]

    assert clusters == expected_clusters
