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

"""Disambiguation configuration."""
import os

"""
    ETHNICITY_DATA_PATH: Location of ethnicity data required for EthnicityEstimator
        training.

    ETHNICITY_MODEL_PATH: Location of dumped ethnicity model.

    DISTANCE_MODEL_PATH: Location of dumped distance model.

    CLUSTERING_N_JOBS: Number of processes to use for clustering.

    DISPLAY_PROGRESS: When True displays progress bar during pairing process.

    LOG_LEVEL: Minimum log level which will be displaying messages.

    REDIS_PHONETIC_BLOCK_KEY: Key in redis from which script will read signature blocks
        to re-cluster.

    REDIS_URL: full redis url.

    REDIS_TIMEOUT: Redis timeout.

    SAMPLED_PAIRS_SIZE: The number of signature pairs we sample during training.

        Since INSPIRE has ~3M curated signatures it would take too much time
        to train on all possible pairs, so we sample ~1M pairs in such a way
        that they are representative of the known clusters structure.

        Note:

            It MUST be a multiple of 12 for the reason explained in
            :mod:`inspirehep.modules.disambiguation.core.ml.sampling`.

    ES_HOSTNAME: hostname and port of elasticsearch.

    ES_TIMEOUT: Timeout set for redis connection.

    ES_MAX_QUERY_SIZE: Maximum size for one page of results from ES.
        Note:
             By default ES allows to get 10000 results at one page at once.
"""


instance_path = os.path.dirname(os.path.abspath(__file__))
disambiguation_base_path = os.path.join(instance_path, "disambiguation")
BASE_PATH = disambiguation_base_path
ETHNICITY_DATA_PATH = os.path.join(disambiguation_base_path, "ethnicity.csv")
ETHNICITY_MODEL_PATH = os.path.join(disambiguation_base_path, "ethnicity.pkl")
DISTANCE_MODEL_PATH = os.path.join(disambiguation_base_path, "distance.pkl")
CLUSTERING_N_JOBS = 8
DISPLAY_PROGRESS = False
LOG_LEVEL = "WARNING"
REDIS_PHONETIC_BLOCK_KEY = "author_phonetic_blocks"
REDIS_TIMEOUT = 60
SAMPLED_PAIRS_SIZE = 12 * 100000
ES_TIMEOUT = 60
ES_HOSTNAME = "localhost:9200"
REDIS_URL = "redis://localhost:6379/0"
ES_MAX_QUERY_SIZE = 9999
