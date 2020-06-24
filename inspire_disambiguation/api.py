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
# or submit itself to any jurisdiction

"""Disambiguation API."""
from datetime import datetime

import requests
import json

import structlog
import math

from inspire_disambiguation import conf
from inspire_disambiguation.core.es.readers import get_input_clusters, get_signatures
from inspire_disambiguation.core.helpers import (
    process_clustering_output,
    train_validation_split,
)
from inspire_disambiguation.core.ml.models import (
    Clusterer,
    DistanceEstimator,
    EthnicityEstimator,
)
from inspire_disambiguation.core.ml.sampling import sample_signature_pairs
from redis import StrictRedis

LOGGER = structlog.getLogger()


def train_and_save_ethnicity_model(load_data_path, save_model_path):
    """Train the ethnicity estimator model and save it to disk.

    Args:
        load_data_path (str): Full path to training data for ethnicity estimator.
        save_model_path (str): Full path where trained ethnicity model will be saved.
    """
    start_time = datetime.now()
    estimator = EthnicityEstimator()
    estimator.load_data(load_data_path)
    load_time = datetime.now()
    LOGGER.info("Training EthnicityEstimator. May take a while...")
    estimator.fit()
    training_time = datetime.now()
    estimator.save_model(save_model_path)
    save_time = datetime.now()
    LOGGER.info(
        "Training ethnicity model",
        load_data_runtime=str(load_time - start_time),
        training_model_runtime=str(training_time - load_time),
        save_model_runtime=str(save_time - training_time),
        total_runtime=str(save_time - start_time),
    )


def train_and_save_distance_model(
    ethnicity_model_path, save_distance_model_path, sampled_pairs_size,
        train_to_validation_split_fraction=0.8
):
    """Train the distance estimator model and save it to disk.

    Args:
        ethnicity_model_path (str): Full path where ethnicity model is saved.
        save_distance_model_path (str): Full path where trained distance model
            will be saved.
        sampled_pairs_size (int): Number of pairs to be generated for the training.
            Note:
                Must be multiple of 4.
    """
    LOGGER.info("Pulling training data from ES")
    start_time = datetime.now()
    curated_signatures = get_signatures(only_curated=True)
    LOGGER.info(
        "Splitting data into training and test set.",
        training_set_fraction=train_to_validation_split_fraction,
    )
    train_signatures_dict, test_signatures_dict = train_validation_split(
        curated_signatures, train_to_validation_split_fraction
    )
    train_signatures_list = train_signatures_dict.values()
    test_signatures_list = test_signatures_dict.values()
    input_clusters_train = get_input_clusters(train_signatures_list)
    input_clusters_test = get_input_clusters(test_signatures_list)
    prepare_intput_time = datetime.now()
    LOGGER.info(
        "Preparing pairs from sampled data for training.",
        pairs_count=sampled_pairs_size,
    )
    pairs_train = list(
        sample_signature_pairs(train_signatures_list, input_clusters_train, sampled_pairs_size)
    )
    prepare_pairs_time = datetime.now()
    pair_size_test = math.ceil(((1 - train_to_validation_split_fraction) / train_to_validation_split_fraction)**2 * sampled_pairs_size)
    pairs_test = list(
        sample_signature_pairs(test_signatures_list, input_clusters_test, pair_size_test)
    )
    ethnicity_estimator = EthnicityEstimator(ethnicity_model_path)
    distance_estimator = DistanceEstimator(ethnicity_estimator)
    prepare_estimators_time = datetime.now()
    distance_estimator.load_data(train_signatures_list, pairs_train, sampled_pairs_size)
    load_data_to_model_time = datetime.now()
    LOGGER.info("Training DistanceEstimator...")
    distance_estimator.fit()
    training_model_time = datetime.now()
    distance_estimator.save_model(save_distance_model_path)
    save_model_time = datetime.now()
    distance_estimator.load_data(test_signatures_list, pairs_test, sampled_pairs_size)
    test_score = distance_estimator.score()
    LOGGER.info(
        "Train distance model",
        prepare_input_runtime=str(prepare_intput_time - start_time),
        prepare_pairs_runtime=str(prepare_pairs_time - prepare_intput_time),
        prepare_estimators_runtime=str(prepare_estimators_time - prepare_pairs_time),
        load_data_runtime=str(load_data_to_model_time - prepare_estimators_time),
        training_model_runtime=str(training_model_time - load_data_to_model_time),
        save_model_runtime=str(save_model_time - training_model_time),
        total_runtime=str(save_model_time - start_time),
        test_score=str(test_score),
    )
    return list(test_signatures_dict)


def cluster(
    ethnicity_model_path,
    distance_model_path,
    n_jobs,
    test_signatures_uuids=None,
    signature_block=None,
):
    """Train the clustering model and process the output.

    Args:
        ethnicity_model_path (str): Full path where ethnicity model is saved.
        distance_model_path (str): Full path where distance model is saved.
        n_jobs (int): Number of processes to use.
        signature_block (str): Signature block indicating which block should be
            clustered. If set to None, clustering will run on all blocks.
        test_signatures_uuids (list): Signature uuids which will be used
        for model validation.
    """
    start_time = datetime.now()
    signatures = get_signatures(signature_block=signature_block)
    if test_signatures_uuids:
        test_labels = []
        for signature in signatures:
            if signature.signature_uuid in test_signatures_uuids:
                test_labels.append(signature.author_id)
                signature.author_id = None
    input_clusters = get_input_clusters(signatures)
    LOGGER.info(
        "Input data",
        signature_block=signature_block,
        signatures_count=len(signatures),
        curated_signatures_count=len(
            [sig for sig in signatures if sig.get("is_curated_author_id")]
        ),
        input_clusters_count=len(input_clusters),
        input_clusters=input_clusters,
    )
    load_data_time = datetime.now()

    distance_estimator = DistanceEstimator.get(
        ethnicity_model_path, distance_model_path
    )
    clusterer = Clusterer(distance_estimator)
    clusterer.load_data(signatures, input_clusters)
    prepare_clusterer_time = datetime.now()
    LOGGER.info("Clustering", signature_block=signature_block)
    clusterer.fit(n_jobs=n_jobs)
    fit_time = datetime.now()
    for phonetic_block, cluster in clusterer.clusterer.clusterers_.items():
        LOGGER.info(
            "Clustering stats",
            load_data_runtime=str(load_data_time - start_time),
            prepare_clusterer_runtime=str(prepare_clusterer_time - load_data_time),
            clustering_runtime=str(fit_time - prepare_clusterer_time),
            total_runtime=str(fit_time - start_time),
            threshold=getattr(
                cluster, "best_threshold_", clusterer.clusterer.base_estimator.threshold
            ),
            signature_block=phonetic_block,
            B3_f_score=cluster.supervised_scoring(clusterer.y, cluster.labels_)
            if hasattr(cluster, "supervised_scoring")
            else None,
        )
    if test_signatures_uuids:
        statistics_names = ('precision', 'recall', 'f1')
        training_statistics = cluster.score(test_signatures_uuids, test_labels)
        (
            (B3_statistics_all, wrongly_classified_pairs),
            B3_statistics_training,
            B3_statistics_test,
        ) = training_statistics
        LOGGER.info(
            B3_precision_recall_f_score_all=dict(zip(statistics_names, B3_statistics_all)),
            B3_precision_recall_f_score_training=dict(zip(statistics_names, B3_statistics_training)),
            B3_precision_recall_f_score_test=dict(zip(statistics_names, B3_statistics_test)),
            wrongly_classified_pairs=wrongly_classified_pairs,
        )

    return process_clustering_output(clusterer)


def cluster_from_redis(ethnicity_model_path, distance_model_path, n_jobs):
    """
    Process all signature blocks from redis set (one by one).
    Args:
        ethnicity_model_path (str): Full path where ethnicity model is saved.
        distance_model_path (str): Full path where distance model is saved.
        n_jobs (int): How many jobs will be running to fit data.

    """
    redis_url = conf["REDIS_URL"]
    redis = StrictRedis.from_url(redis_url, decode_responses=True)
    while True:
        signature_block_data = redis.bzpopmin(
            conf["REDIS_PHONETIC_BLOCK_KEY"], conf["REDIS_TIMEOUT"]
        )
        if not signature_block_data:
            LOGGER.warning("No signature blocks in redis to process! STOP.")
            break
        signature_block = signature_block_data[1]
        LOGGER.info("Clustering signature_block", signature_block=signature_block)
        clusters = cluster(
            ethnicity_model_path, distance_model_path, n_jobs, signature_block
        )
        LOGGER.info("Output", output_clusters=clusters, signature_block=signature_block)
        response = send_clusters_to_inspirehep(clusters)

        if response.status_code != 200:
            LOGGER.error(
                "Failed to post clustering output for signature block.",
                signature_block=signature_block,
                error_msg=response.text,
                status_code=response.status_code,
            )


def send_clusters_to_inspirehep(clusters):
    headers = {
        "Authorization": f"Bearer {conf['INSPIREHEP_AUTHENTICATION_TOKEN']}",
        "content-type": "application/json",
    }
    response = requests.post(
        conf["INSPIREHEP_DISAMBIGUATION_URL"],
        data=json.dumps({"clusters": clusters}),
        headers=headers,
    )
    return response
