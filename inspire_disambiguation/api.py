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
import json
import math
from datetime import datetime

import numpy as np
import requests
import structlog
from beard.metrics import b3_f_score, b3_precision_recall_fscore
from inspire_disambiguation import conf
from inspire_disambiguation.core.es.readers import (get_input_clusters,
                                                    get_curated_signature_blocks,
                                                    get_signatures)
from inspire_disambiguation.core.helpers import (process_clustering_output,
                                                 train_validation_split)
from inspire_disambiguation.core.ml.models import (Clusterer,
                                                   DistanceEstimator,
                                                   EthnicityEstimator)
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
    ethnicity_model_path,
    save_distance_model_path,
    sampled_pairs_size,
    train_to_validation_split_fraction=0.8,
):
    """Train the distance estimator model and save it to disk.

    Args:
        ethnicity_model_path (str): Full path where ethnicity model is saved.
        save_distance_model_path (str): Full path where trained distance model
            will be saved.
        sampled_pairs_size (int): Number of pairs to be generated for the training.
            Note:
                Must be multiple of 4.
        train_to_validation_split_fraction (float): fraction of the data
            used for training.
    """
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
        sample_signature_pairs(
            train_signatures_list, input_clusters_train, sampled_pairs_size
        )
    )
    prepare_pairs_time = datetime.now()
    # must be multiple of 4
    pair_size_test = 4 * math.ceil(
        (
            (
                (1 - train_to_validation_split_fraction)
                / train_to_validation_split_fraction
            )
            ** 2
            * sampled_pairs_size
        )
        / 4
    )
    pairs_test = list(
        sample_signature_pairs(
            test_signatures_list, input_clusters_test, pair_size_test
        )
    )
    LOGGER.info(
        "Pairs prepared.",
        n_training_pairs=len(pairs_train),
        n_test_pairs=len(pairs_test),
    )
    ethnicity_estimator = EthnicityEstimator(ethnicity_model_path)
    distance_estimator = DistanceEstimator(ethnicity_estimator)
    prepare_estimators_time = datetime.now()
    distance_estimator.load_data(train_signatures_list, pairs_train, sampled_pairs_size)
    load_data_to_model_time = datetime.now()
    distance_estimator.fit()
    training_model_time = datetime.now()
    distance_estimator.save_model(save_distance_model_path)
    save_model_time = datetime.now()
    distance_estimator.load_data(test_signatures_list, pairs_test, pair_size_test)
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
    return set(test_signatures_dict)


def cluster(
    ethnicity_model_path, distance_model_path, n_jobs, signature_block=None,
):
    """Train the clustering model and process the output.

    Args:
        ethnicity_model_path (str): Full path where ethnicity model is saved.
        distance_model_path (str): Full path where distance model is saved.
        n_jobs (int): Number of processes to use.
        signature_block (str): Signature block indicating which block should be
            clustered. If set to None, clustering will run on all blocks.
    """
    start_time = datetime.now()
    LOGGER.info("Preparing test dataset...")
    signatures = get_signatures(signature_block=signature_block)
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
    return process_clustering_output(clusterer)


def cluster_with_evaluation(
    ethnicity_model_path, distance_model_path, n_jobs, test_signatures_uuids=None,
):
    """Train the clustering model and process the output.

    Args:
        ethnicity_model_path (str): Full path where ethnicity model is saved.
        distance_model_path (str): Full path where distance model is saved.
        n_jobs (int): Number of processes to use.
        signature_block (str): Signature block indicating which block should be
            clustered. If set to None, clustering will run on all blocks.
        test_signatures_uuids (set): Signature uuids which will be used
        for model validation.
    """
    start_time = datetime.now()
    signature_blocks = get_curated_signature_blocks()
    labels_train, labels_test, y_train, y_test = (
        np.array([]),
        np.array([]),
        np.array([]),
        np.array([]),
    )
    statistics_names = ("precision", "recall", "f1")
    for clustered_blocks, block in enumerate(signature_blocks, 1):
        LOGGER.info(
            "Clustering a new block",  current=clustered_blocks, total=(len(signature_blocks) + 1)
        )
        test_signatures = []
        test_authors_ids = []
        signatures = get_signatures(signature_block=block, only_curated=True)
        input_clusters_with_all_labels = get_input_clusters(signatures)
        for signature in signatures:
            if signature.signature_uuid in test_signatures_uuids:
                test_authors_ids.append(signature.author_id)
                signature.author_id = None
                test_signatures.append(signature.signature_uuid)
        input_clusters = get_input_clusters(signatures)
        test_labels = []
        for cluster in input_clusters:
            for signature in cluster["signature_uuids"]:
                if signature in test_signatures:
                    test_labels.append(cluster["cluster_id"])
        LOGGER.info(
            "Input data",
            signature_block=block,
            signatures_count=len(signatures),
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
        LOGGER.info("Clustering", signature_block=block)
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
                    cluster,
                    "best_threshold_",
                    clusterer.clusterer.base_estimator.threshold,
                ),
                signature_block=phonetic_block,
            )
            (
                labels_train_per_block,
                y_train_per_block,
                labels_test_per_block,
                y_test_per_block,
            ) = clusterer.prepare_test_data(test_signatures_uuids, test_labels)
            (
                B3_statistics_all_per_block,
                B3_statistics_training_per_block,
                B3_statistics_test_per_block,
            ) = clusterer.score(
                labels_train_per_block,
                y_train_per_block,
                labels_test_per_block,
                y_test_per_block,
            )
            nb_of_clusters_per_author = clusterer.nb_of_clusters_predicted_for_author(
                input_clusters_with_all_labels, test_authors_ids
            )
            LOGGER.info(
                "Clustering results for block {}".format(block),
                train_dataset_size=y_train_per_block.size,
                test_dataset_size=y_test_per_block.size,
                true_number_of_clusters=np.unique(clusterer.y).size,
                predicted_number_of_clusters=np.unique(
                    clusterer.clusterer.labels_
                ).size,
                B3_precision_recall_f_score_all=dict(
                    zip(statistics_names, B3_statistics_all_per_block)
                ),
                B3_precision_recall_f_score_training=dict(
                    zip(statistics_names, B3_statistics_training_per_block)
                ),
                B3_precision_recall_f_score_test=dict(
                    zip(statistics_names, B3_statistics_test_per_block)
                )
                if B3_statistics_test_per_block
                else None,
                nb_of_clusters_per_author=nb_of_clusters_per_author
            )
            labels_train = np.concatenate((labels_train, labels_train_per_block))
            y_train = np.concatenate((y_train, y_train_per_block))
            labels_test = np.concatenate((labels_test, labels_test_per_block))
            y_test = np.concatenate((y_test, y_test_per_block))

    B3_statistics_training = b3_precision_recall_fscore(y_train, labels_train)
    B3_statistics_test = b3_precision_recall_fscore(y_test, labels_test)
    B3_statistics_all = b3_precision_recall_fscore(
        np.append(y_train, y_test), np.append(labels_train, labels_test)
    )
    LOGGER.info(
        "Clustering results for all the blocks",
        B3_precision_recall_f_score_all=B3_statistics_all,
        B3_statistics_training=B3_statistics_training,
        B3_statistics_test=B3_statistics_test,
    )


def cluster_from_redis(
    ethnicity_model_path, distance_model_path, n_jobs,
):
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
            ethnicity_model_path, distance_model_path, n_jobs, signature_block,
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
