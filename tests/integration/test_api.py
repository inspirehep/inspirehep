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
import os

from inspire_disambiguation.api import train_and_save_distance_model, cluster_from_redis


@patch("inspire_disambiguation.core.ml.models.Pipeline.fit")
@patch("inspire_disambiguation.core.ml.sampling.random.choice")
@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_train_and_save_distance_model(
    scan_mock,
    choices_mock,
    fit_mock,
    tmpdir,
    ethnicity_path,
    es_record_with_many_curated_authors,
):
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
    choices_mock.side_effect = choices
    scan_mock.side_effect = [[es_record_with_many_curated_authors]]
    distance_model_path = tmpdir.join("distance.pkl")
    train_and_save_distance_model(ethnicity_path, distance_model_path, 4)
    assert os.path.getsize(distance_model_path) > 0


@patch("inspire_disambiguation.api.cluster")
@patch("inspire_disambiguation.api.StrictRedis.bzpopmin")
def test_cluster_from_redis(redis_mock, cluster_mock):
    redis_mock.side_effect = [
        ("author_phonetic_blocks", "BLOCK_1", "1566893840"),
        ("author_phonetic_blocks", "BLOCK_2", "1566893841"),
        ("author_phonetic_blocks", "BLOCK_3", "1566893842"),
        None,
    ]
    cluster_from_redis(None, None, None)
    redis_mock.assert_called_with("author_phonetic_blocks", 60)
