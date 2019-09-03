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
import pytest

from inspire_disambiguation.core.es.readers import get_signatures, get_input_clusters
from inspire_disambiguation.core.ml.sampling import (
    sample_signature_pairs,
    IncompleteSamplingError,
)


@patch("inspire_disambiguation.core.ml.sampling.random.choice")
@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_sample_signature_pairs(
    scan_mock, random_choice, es_record_with_many_curated_authors
):
    scan_mock.side_effect = [[es_record_with_many_curated_authors]]
    signatures = get_signatures()
    clusters = get_input_clusters(signatures)
    choices = [
        # same cluster, different name
        ("JOhn", "94fc2b0a-dc17-42c2-bae3-ca0024079e52"),
        "94fc2b0a-dc17-42c2-bae3-ca0024079e53",
        # same cluster, same name
        ("JOhn", "94fc2b0a-dc17-42c2-bae3-ca0024079e54"),
        "94fc2b0a-dc17-42c2-bae3-ca0024079e55",
        # different cluster, different name
        ("JOhn", "94fc2b0a-dc17-42c2-bae3-ca0024079e56"),
        "94fc2b0a-dc17-42c2-bae3-ca0024079e57",
        # different cluster, same name
        ("JOhn", "94fc2b0a-dc17-42c2-bae3-ca0024079e52"),
        "94fc2b0a-dc17-42c2-bae3-ca0024079e54",
    ]
    random_choice.side_effect = choices
    pairs = [pair for pair in sample_signature_pairs(signatures, clusters, 4)]
    expected_pairs = [
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

    assert pairs == expected_pairs


@patch("inspire_disambiguation.core.ml.sampling.random.choice")
@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_sample_signature_pairs_could_not_generate_pairs(
    scan_mock, random_choice, es_record_with_many_curated_authors
):
    scan_mock.side_effect = [[es_record_with_many_curated_authors]]
    signatures = get_signatures()
    clusters = get_input_clusters(signatures)
    # it won't be able to generate the needed pairs
    # because it can only find the same cluster, different name
    choices = [
        ("JOhn", "94fc2b0a-dc17-42c2-bae3-ca0024079e52"),
        "94fc2b0a-dc17-42c2-bae3-ca0024079e53",
    ] * 64
    random_choice.side_effect = choices
    with pytest.raises(IncompleteSamplingError):
        [pair for pair in sample_signature_pairs(signatures, clusters, 4)]
