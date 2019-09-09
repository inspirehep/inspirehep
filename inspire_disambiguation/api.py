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
import logging
import pprint
import requests
import json

from inspire_disambiguation import conf
from inspire_disambiguation.core.es.readers import get_input_clusters, get_signatures
from inspire_disambiguation.core.helpers import process_clustering_output
from inspire_disambiguation.core.ml.models import (
    Clusterer,
    DistanceEstimator,
    EthnicityEstimator,
)
from inspire_disambiguation.core.ml.sampling import sample_signature_pairs
from redis import StrictRedis

LOGGER = logging.getLogger(__file__)


def train_and_save_ethnicity_model(load_data_path, save_model_path):
    """Train the ethnicity estimator model and save it to disk.

    Args:
        load_data_path (str): Full path to training data for ethnicity estimator.
        save_model_path (str): Full path where trained ethnicity model will be saved.
    """
    estimator = EthnicityEstimator()
    estimator.load_data(load_data_path)
    LOGGER.info("Training EthnicityEstimator. May take a while...")
    estimator.fit()
    estimator.save_model(save_model_path)


def train_and_save_distance_model(
    ethnicity_model_path, save_distance_model_path, sampled_pairs_size
):
    """Train the distance estimator model and save it to disk.

    Args:
        ethnicity_model_path (str): Full path where ethnicity model is saved.
        save_distance_model_path (str): Full path where trained distance model
            will be saved.
        sampled_pairs_size (int): Number of pairs to be generated for the training.
            Note:
                Must be multiple of 12.
    """
    LOGGER.info("Pulling training data from ES")
    curated_signatures = get_signatures(only_curated=True)
    input_clusters = get_input_clusters(curated_signatures)
    LOGGER.info(
        "Preparing %s pairs from sampled data for training.", sampled_pairs_size
    )
    pairs = list(
        sample_signature_pairs(curated_signatures, input_clusters, sampled_pairs_size)
    )

    ethnicity_estimator = EthnicityEstimator(ethnicity_model_path)
    distance_estimator = DistanceEstimator(ethnicity_estimator)
    distance_estimator.load_data(curated_signatures, pairs, sampled_pairs_size)
    LOGGER.info("Training DistanceEstimator...")
    distance_estimator.fit()
    distance_estimator.save_model(save_distance_model_path)


def cluster(ethnicity_model_path, distance_model_path, n_jobs, signature_block=None):
    """Train the clustering model and process the output.

    Args:
        ethnicity_model_path (str): Full path where ethnicity model is saved.
        distance_model_path (str): Full path where distance model is saved.
        n_jobs (int): Number of processes to use.
        signature_block (str): Signature block indicating which block should be
            clustered. If set to None, clustering will run on all blocks.
    """
    LOGGER.info("Pulling signatures for block '%s' from ES", signature_block)

    signatures = get_signatures(signature_block=signature_block)
    input_clusters = get_input_clusters(signatures)
    LOGGER.debug(
        "Got %s signature_blocks and %s input_clusters",
        len(signatures),
        len(input_clusters),
    )
    distance_estimator = DistanceEstimator.get(
        ethnicity_model_path, distance_model_path
    )

    clusterer = Clusterer(distance_estimator)
    clusterer.load_data(signatures, input_clusters)
    LOGGER.info("Starting clustering")
    clusterer.fit(n_jobs=n_jobs)

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
        LOGGER.info("Clustering signature_block '%s'", signature_block)
        clusters = cluster(
            ethnicity_model_path, distance_model_path, n_jobs, signature_block
        )
        LOGGER.info("%s", pprint.pformat(clusters, indent=4))
        response = send_clusters_to_inspirehep(clusters)

        if response.status_code != 200:
            LOGGER.error(
                "Failed to post clustering output for signature block %s, error: %s, "
                "status code: %d",
                signature_block,
                response.text,
                response.status_code,
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
