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

import os

from inspire_disambiguation import conf
from inspire_disambiguation.api import (cluster_from_redis,
                                        train_and_save_distance_model)
from inspire_disambiguation.core.data_models.publication import Publication
from inspire_disambiguation.core.data_models.signature import Signature
from mock import patch


@patch("inspire_disambiguation.core.ml.models.Pipeline.score")
@patch("inspire_disambiguation.core.ml.models.Pipeline.fit")
@patch("inspire_disambiguation.core.ml.sampling.random.choice")
@patch("inspire_disambiguation.api.train_validation_split")
@patch("inspire_disambiguation.core.es.readers.LiteratureSearch.scan")
def test_train_and_save_distance_model(
    scan_mock,
    sample_mock,
    choices_mock,
    fit_mock,
    score_mock,
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
    scan_mock.side_effect = [[es_record_with_many_curated_authors]]
    signatures = [
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
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e53",
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
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e56",
            is_curated_author_id=True,
        ),
        Signature(
            author_affiliation="",
            author_id=3,
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
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e57",
            is_curated_author_id=True,
        ),
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
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e58",
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
            signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e59",
            is_curated_author_id=True,
        ),
    ]
    choices_mock.side_effect = choices + choices
    signatures_dict = {signature.signature_uuid: signature for signature in signatures}
    signatures_list = [signatures_dict, signatures_dict]
    sample_mock.return_value = signatures_list
    score_mock.return_value = 0.85
    distance_model_path = tmpdir.join("distance.pkl")
    train_and_save_distance_model(ethnicity_path, distance_model_path, 4)
    assert os.path.getsize(distance_model_path) > 0


@patch("inspire_disambiguation.api.cluster")
@patch("inspire_disambiguation.api.StrictRedis.bzpopmin")
def test_cluster_from_redis(redis_mock, cluster_mock, requests_mock):
    requests_mock.post(conf["INSPIREHEP_DISAMBIGUATION_URL"])
    redis_mock.side_effect = [
        ("author_phonetic_blocks", "BLOCK_1", "1566893840"),
        ("author_phonetic_blocks", "BLOCK_2", "1566893841"),
        ("author_phonetic_blocks", "BLOCK_3", "1566893842"),
        None,
    ]
    cluster_mock.side_effect = [
        "clustering_result1",
        "clustering_result2",
        "clustering_result3",
    ]
    cluster_from_redis(None, None, None)
    redis_mock.assert_called_with("author_phonetic_blocks", 60)
    assert requests_mock.call_count == 3
    history = requests_mock.request_history[0]
    assert (
        "Authorization" in history.headers
        and f"Bearer {conf['INSPIREHEP_AUTHENTICATION_TOKEN']}"
        == history.headers["Authorization"]
    )
    assert history.url == conf["INSPIREHEP_DISAMBIGUATION_URL"]
    assert history.json() == {"clusters": "clustering_result1"}
