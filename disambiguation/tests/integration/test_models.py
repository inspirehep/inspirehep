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

from mock import patch
from numpy import array
from inspire_disambiguation.core.data_models.publication import Publication
from inspire_disambiguation.core.data_models.signature import Signature
from inspire_disambiguation.core.es.readers import get_signatures, get_input_clusters
from inspire_disambiguation.core.ml.models import DistanceEstimator, Clusterer


@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_distance_estimator_load_data(scan_mock, es_record_with_many_curated_authors):
    scan_mock.side_effect = [[es_record_with_many_curated_authors]]
    signatures = get_signatures()
    pairs = [
        {
            "same_cluster": True,
            "signature_uuids": [
                "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
                "94fc2b0a-dc17-42c2-bae3-ca0024079e53",
            ],
        },
        {
            "same_cluster": True,
            "signature_uuids": [
                "94fc2b0a-dc17-42c2-bae3-ca0024079e54",
                "94fc2b0a-dc17-42c2-bae3-ca0024079e55",
            ],
        },
        {
            "same_cluster": False,
            "signature_uuids": [
                "94fc2b0a-dc17-42c2-bae3-ca0024079e56",
                "94fc2b0a-dc17-42c2-bae3-ca0024079e57",
            ],
        },
        {
            "same_cluster": False,
            "signature_uuids": [
                "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
                "94fc2b0a-dc17-42c2-bae3-ca0024079e54",
            ],
        },
    ]
    distance_estimator = DistanceEstimator(None)
    distance_estimator.load_data(signatures, pairs, 4)
    expected_X = array(
        [
            [
                Signature(
                    author_affiliation="Rutgers U., Piscataway",
                    author_id=1,
                    author_name="Doe, John",
                    publication=Publication(
                        abstract="Many curated authors",
                        authors=[
                            "Doe, John",
                            "Doe, J",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Jamie",
                            "Jamie",
                        ],
                        collaborations=[],
                        keywords=["keyword"],
                        publication_id=1,
                        title="Title",
                        topics=["category"],
                    ),
                    signature_block="JOhn",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
                    is_curated_author_id=True,
                ),
                Signature(
                    author_affiliation="Rutgers U., Piscataway",
                    author_id=1,
                    author_name="Doe, J",
                    publication=Publication(
                        abstract="Many curated authors",
                        authors=[
                            "Doe, John",
                            "Doe, J",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Jamie",
                            "Jamie",
                        ],
                        collaborations=[],
                        keywords=["keyword"],
                        publication_id=1,
                        title="Title",
                        topics=["category"],
                    ),
                    signature_block="JOhn",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e53",
                    is_curated_author_id=True,
                ),
            ],
            [
                Signature(
                    author_affiliation="Rutgers U., Piscataway",
                    author_id=2,
                    author_name="Doe, John",
                    publication=Publication(
                        abstract="Many curated authors",
                        authors=[
                            "Doe, John",
                            "Doe, J",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Jamie",
                            "Jamie",
                        ],
                        collaborations=[],
                        keywords=["keyword"],
                        publication_id=1,
                        title="Title",
                        topics=["category"],
                    ),
                    signature_block="JOhn",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e54",
                    is_curated_author_id=True,
                ),
                Signature(
                    author_affiliation="Rutgers U., Piscataway",
                    author_id=2,
                    author_name="Doe, John",
                    publication=Publication(
                        abstract="Many curated authors",
                        authors=[
                            "Doe, John",
                            "Doe, J",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Jamie",
                            "Jamie",
                        ],
                        collaborations=[],
                        keywords=["keyword"],
                        publication_id=1,
                        title="Title",
                        topics=["category"],
                    ),
                    signature_block="JOhn",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e55",
                    is_curated_author_id=True,
                ),
            ],
            [
                Signature(
                    author_affiliation="",
                    author_id=6,
                    author_name="Doe, John",
                    publication=Publication(
                        abstract="Many curated authors",
                        authors=[
                            "Doe, John",
                            "Doe, J",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Jamie",
                            "Jamie",
                        ],
                        collaborations=[],
                        keywords=["keyword"],
                        publication_id=1,
                        title="Title",
                        topics=["category"],
                    ),
                    signature_block="JOhn",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e56",
                    is_curated_author_id=True,
                ),
                Signature(
                    author_affiliation="Rutgers U., Piscataway",
                    author_id=7,
                    author_name="Jamie",
                    publication=Publication(
                        abstract="Many curated authors",
                        authors=[
                            "Doe, John",
                            "Doe, J",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Jamie",
                            "Jamie",
                        ],
                        collaborations=[],
                        keywords=["keyword"],
                        publication_id=1,
                        title="Title",
                        topics=["category"],
                    ),
                    signature_block="Jana",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e57",
                    is_curated_author_id=True,
                ),
            ],
            [
                Signature(
                    author_affiliation="Rutgers U., Piscataway",
                    author_id=1,
                    author_name="Doe, John",
                    publication=Publication(
                        abstract="Many curated authors",
                        authors=[
                            "Doe, John",
                            "Doe, J",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Jamie",
                            "Jamie",
                        ],
                        collaborations=[],
                        keywords=["keyword"],
                        publication_id=1,
                        title="Title",
                        topics=["category"],
                    ),
                    signature_block="JOhn",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
                    is_curated_author_id=True,
                ),
                Signature(
                    author_affiliation="Rutgers U., Piscataway",
                    author_id=2,
                    author_name="Doe, John",
                    publication=Publication(
                        abstract="Many curated authors",
                        authors=[
                            "Doe, John",
                            "Doe, J",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Doe, John",
                            "Jamie",
                            "Jamie",
                        ],
                        collaborations=[],
                        keywords=["keyword"],
                        publication_id=1,
                        title="Title",
                        topics=["category"],
                    ),
                    signature_block="JOhn",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e54",
                    is_curated_author_id=True,
                ),
            ],
        ],
        dtype=object,
    )
    expected_y = array([0, 0, 1, 1])
    assert (distance_estimator.X == expected_X).all()
    assert (distance_estimator.y == expected_y).all()


@patch("inspire_disambiguation.core.ml.models.DistanceEstimator")
@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_clusterer_load_data(
    scan_mock,
    distance_estimator_mock,
    es_record_with_curated_author,
    es_record_with_non_curated_author,
):
    scan_mock.side_effect = [
        [es_record_with_curated_author, es_record_with_non_curated_author]
    ]
    signatures = get_signatures()
    input_clusters = get_input_clusters(signatures)
    clusterer = Clusterer(distance_estimator_mock)
    clusterer.load_data(signatures, input_clusters)
    expected_X = array(
        [
            [
                Signature(
                    author_affiliation="Rutgers U., Piscataway",
                    author_id=989441,
                    author_name="Doe, John",
                    publication=Publication(
                        abstract="2 curated authors with recid",
                        authors=["Doe, John"],
                        collaborations=["ATLAS"],
                        keywords=["effective action", "approximation: semiclassical"],
                        publication_id=374836,
                        title="Title",
                        topics=["Theory-HEP"],
                    ),
                    signature_block="JOhn",
                    signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
                    is_curated_author_id=True,
                )
            ],
            [
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
                )
            ],
        ],
        dtype=object,
    )

    expected_y = array([0, -1])
    assert (clusterer.X == expected_X).all()
    assert (clusterer.y == expected_y).all()
