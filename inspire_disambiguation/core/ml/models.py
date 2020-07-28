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

"""Disambiguation core ML models."""

import csv
import pickle
from functools import partial

import numpy as np
from beard.clustering import (BlockClustering, ScipyHierarchicalClustering,
                              block_phonetic)
from beard.metrics import b3_f_score, b3_precision_recall_fscore
from beard.similarity import (CosineSimilarity, ElementMultiplication,
                              EstimatorTransformer, PairTransformer,
                              StringDistance)
from beard.utils import FuncTransformer, Shaper, normalize_name
from inspire_disambiguation.core.helpers import (compute_clustering_statistics,
                                                 get_abstract,
                                                 get_author_full_name,
                                                 get_author_other_names,
                                                 get_coauthors_neighborhood,
                                                 get_collaborations,
                                                 get_first_given_name,
                                                 get_keywords,
                                                 get_normalized_affiliation,
                                                 get_second_given_name,
                                                 get_second_initial, get_title,
                                                 get_topics,
                                                 group_by_signature,
                                                 load_signatures)
from inspire_disambiguation.utils import open_file_in_folder
from scipy.special import expit
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.svm import LinearSVC


class EthnicityEstimator(object):
    def __init__(self, model_filename=None, C=4.0):
        self.C = C
        if model_filename:
            self.load_model(model_filename)

    def load_data(self, input_filename):
        """Loads ethnicity data from file

        Args:
            input_filename (str): Path to data file

        Example:
            RACE,NAMELAST,NAMEFRST
            1,SHERIDAN,CHARLES B
            2,TAYLOR,HERDSON
            3,JOHNSON,LUCY A
        """
        ethnicities, lasts, firsts = [], [], []
        with open(input_filename, "r") as fd:
            reader = csv.DictReader(fd)
            for row in reader:
                ethnicities.append(int(row["RACE"]))
                lasts.append(row["NAMELAST"])
                firsts.append(row["NAMEFRST"])

        names = ["%s, %s" % (last, first) for last, first in zip(lasts, firsts)]
        normalized_names = [normalize_name(name) for name in names]

        self.X = normalized_names
        self.y = ethnicities

    def load_model(self, input_filename):
        """Loads model dumped by pickle

        Args:
            input_filename (str): path to file with dumped EthnicityEstimator object
        """
        with open(input_filename, "rb") as fd:
            self.estimator = pickle.load(fd)

    def save_model(self, output_filename):
        """Dump object to a file

        Args:
            output_filename (str): Path where object will be dumped
        """
        with open_file_in_folder(output_filename, "wb") as fd:
            pickle.dump(self.estimator, fd, protocol=pickle.HIGHEST_PROTOCOL)

    def fit(self):
        """Fit data using the estimator"""
        self.estimator = Pipeline(
            [
                (
                    "transformer",
                    TfidfVectorizer(
                        analyzer="char_wb",
                        ngram_range=(1, 5),
                        min_df=0.00005,
                        dtype=np.float32,
                        decode_error="replace",
                    ),
                ),
                ("classifier", LinearSVC(C=self.C)),
            ]
        )
        self.estimator.fit(self.X, self.y)

    def predict(self, X):
        """Apply transforms to the data, and predict with the final estimator

        Args:
            X (iterable): Data to predict on. Must fulfill input requirements
                of first step of the pipeline.
        """
        return self.estimator.predict(X)


class DistanceEstimator(object):
    _instance = None

    def __init__(self, ethnicity_estimator, distance_model_file=None):
        """

        Args:
            ethnicity_estimator (InstanceEstimator): Instance of EthnicityEstimator
            distance_model_file (str): Full path to DistanceEstimator pickle
        """
        self.ethnicity_estimator = ethnicity_estimator
        if distance_model_file:
            self.load_model(distance_model_file)

    @classmethod
    def get(cls, ethnicity_model_path, distance_model_path):
        """Loads already trained distance_estimator
            or get an instance if was already loaded

        Args:
            ethnicity_model_path (str): Full path to EthnicityEstimator pickle
            distance_model_path (str): Full path to DistanceEstimator pickle
        """
        if not cls._instance:
            ethnicity = EthnicityEstimator(ethnicity_model_path)
            cls._instance = cls(ethnicity, distance_model_path)
        return cls._instance

    def load_data(self, curated_signatures, pairs, pairs_size):
        """Loads training data to the estimator vectors

        Args:
            curated_signatures (iterable): Signatures for the training
            pairs (iterable): Pairs of signatures and clusters for the training
            pairs_size (int): Amount of pairs

        """
        signatures_by_uuid = load_signatures(curated_signatures)

        self.X = np.empty((pairs_size, 2), dtype=np.object)
        self.y = np.empty(pairs_size, dtype=np.int)

        for i, pair in enumerate(pairs):
            self.X[i, 0] = signatures_by_uuid[pair["signature_uuids"][0]]
            self.X[i, 1] = signatures_by_uuid[pair["signature_uuids"][1]]
            self.y[i] = 0 if pair["same_cluster"] else 1

    def load_model(self, input_filename):
        """Loads model dumped by pickle

        Args:
            input_filename (str): path to file with dumped ethnicity model
        """
        with open(input_filename, "rb") as fd:
            self.distance_estimator = pickle.load(fd)
        DistanceEstimator._instance = self

    def save_model(self, output_filename):
        """Dump model to a file

        Args:
            output_filename (str): Path where model will be dumped
        """
        with open_file_in_folder(output_filename, "wb") as fd:
            pickle.dump(self.distance_estimator, fd, protocol=pickle.HIGHEST_PROTOCOL)

    def fit(self):
        """Fit data using the estimator"""
        transformer = FeatureUnion(
            [
                (
                    "author_full_name_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "full_name",
                                                FuncTransformer(
                                                    func=get_author_full_name
                                                ),
                                            ),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    analyzer="char_wb",
                                                    ngram_range=(2, 4),
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "author_second_initial_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=FuncTransformer(
                                        func=get_second_initial
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            (
                                "combiner",
                                StringDistance(
                                    similarity_function="character_equality"
                                ),
                            ),
                        ]
                    ),
                ),
                (
                    "author_first_given_name_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=FuncTransformer(
                                        func=get_first_given_name
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", StringDistance()),
                        ]
                    ),
                ),
                (
                    "author_second_given_name_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=FuncTransformer(
                                        func=get_second_given_name
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", StringDistance()),
                        ]
                    ),
                ),
                (
                    "author_other_names_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "other_names",
                                                FuncTransformer(
                                                    func=get_author_other_names
                                                ),
                                            ),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    analyzer="char_wb",
                                                    ngram_range=(2, 4),
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "affiliation_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "affiliation",
                                                FuncTransformer(
                                                    func=get_normalized_affiliation
                                                ),
                                            ),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    analyzer="char_wb",
                                                    ngram_range=(2, 4),
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "coauthors_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "coauthors",
                                                FuncTransformer(
                                                    func=get_coauthors_neighborhood
                                                ),
                                            ),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "abstract_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "abstract",
                                                FuncTransformer(func=get_abstract),
                                            ),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "keywords_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "keywords",
                                                FuncTransformer(func=get_keywords),
                                            ),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "collaborations_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "collaborations",
                                                FuncTransformer(
                                                    func=get_collaborations
                                                ),
                                            ),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "subject_similairty",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "keywords",
                                                FuncTransformer(func=get_topics),
                                            ),
                                            ("shaper", Shaper(newshape=(-1))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "title_similarity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            ("title", FuncTransformer(func=get_title)),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "tf-idf",
                                                TfidfVectorizer(
                                                    analyzer="char_wb",
                                                    ngram_range=(2, 4),
                                                    dtype=np.float32,
                                                    decode_error="replace",
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("combiner", CosineSimilarity()),
                        ]
                    ),
                ),
                (
                    "author_ethnicity",
                    Pipeline(
                        [
                            (
                                "pairs",
                                PairTransformer(
                                    element_transformer=Pipeline(
                                        [
                                            (
                                                "name",
                                                FuncTransformer(
                                                    func=get_author_full_name
                                                ),
                                            ),
                                            ("shaper", Shaper(newshape=(-1,))),
                                            (
                                                "classifier",
                                                EstimatorTransformer(
                                                    self.ethnicity_estimator.estimator
                                                ),
                                            ),
                                        ]
                                    ),
                                    groupby=group_by_signature,
                                ),
                            ),
                            ("sigmoid", FuncTransformer(func=expit)),
                            ("combiner", ElementMultiplication()),
                        ]
                    ),
                ),
            ]
        )
        classifier = RandomForestClassifier(n_estimators=500, n_jobs=8)

        self.distance_estimator = Pipeline(
            [("transformer", transformer), ("classifier", classifier)]
        )
        self.distance_estimator.fit(self.X, self.y)

    def score(self):
        return self.distance_estimator.score(self.X, self.y)


class Clusterer(object):
    def __init__(self, estimator):
        # TODO get rid of this global
        global distance_estimator
        distance_estimator = estimator.distance_estimator
        try:
            distance_estimator.steps[-1][1].set_params(n_jobs=1)
        except Exception:
            pass

        # threshold determines when to split blocks
        # into smaller ones adding first initial
        self.block_function = partial(
            block_phonetic, threshold=0, phonetic_algorithm="nysiis"
        )

        self.clustering_threshold = 0.709  # magic value taken from BEARD example
        self.clustering_method = "average"

    def load_data(self, signatures, input_clusters):
        """Loads data to the estimator vectors

        Args:
            signatures (iterable): Signatures which should be processed
            input_clusters (iterable): Input clusters built for provided signatures
                see: `inspire_disambiguation.core.es.readers.get_input_clusters`

        """
        signatures_by_uuid = load_signatures(signatures)

        self.X = np.empty((len(signatures_by_uuid), 1), dtype=np.object)
        self.y = -np.ones(len(self.X), dtype=np.int)

        i = 0
        for cluster in input_clusters:
            for signature_uuid in cluster["signature_uuids"]:
                if signature_uuid not in signatures_by_uuid:
                    continue  # TODO figure out how this can happen
                self.X[i, 0] = signatures_by_uuid[signature_uuid]
                self.y[i] = cluster["cluster_id"]
                i += 1

    def load_model(self, input_filename):
        """Loads model dumped by pickle

        Args:
            input_filename (str): path to file with dumped ethnicity model.
        """
        with open(input_filename, "rb") as fd:
            self.clusterer = pickle.load(fd)

    def save_model(self, output_filename):
        """Dump object to a file

        Args:
            output_filename (str): Path where model will be dumped
        """
        with open_file_in_folder(output_filename, "wb") as fd:
            pickle.dump(self.clusterer, fd, protocol=pickle.HIGHEST_PROTOCOL)

    def fit(self, n_jobs=8):
        """Fit data using the estimator"""
        self.clusterer = BlockClustering(
            blocking=self.block_function,
            base_estimator=ScipyHierarchicalClustering(
                affinity=_affinity,
                threshold=self.clustering_threshold,
                method=self.clustering_method,
                supervised_scoring=b3_f_score,
            ),
            n_jobs=n_jobs,
            verbose=True,
        )
        self.clusterer.fit(self.X, self.y)

    def score(self, test_uuids, labels):
        """
        Return the clustering statistics (b3 precision, b3 recall, b3 f1 score)
        and wrongly clustered samples for training, test and the whole dataset.

        Args:
            test_uuids - set of signatures uuids used for testing
            labels - list of labels (author id) for test dataset
        """
        all_uuids = np.vectorize(lambda x: x.signature_uuid)(self.X).flatten()
        test_uuids_array = np.array(list(test_uuids))
        mask = np.isin(all_uuids, test_uuids_array)
        y_train = self.y[~mask]
        y_test = np.array(labels)
        labels_train = self.clusterer.labels_[~mask]
        labels_test = self.clusterer.labels_[mask]
        return (
            compute_clustering_statistics(self.X, self.y, self.clusterer.labels_),
            b3_precision_recall_fscore(y_train, labels_train),
            b3_precision_recall_fscore(y_test, labels_test),
        )


def _affinity(X, step=10000):
    """Custom affinity function, using a pre-learned distance estimator."""
    # TODO find a way to avoid a global here, needed to avoid pickling/copying
    # the distance_estimator when passing the clusterers for each block around
    global distance_estimator
    all_i, all_j = np.triu_indices(len(X), k=1)
    n_pairs = len(all_i)
    distances = np.zeros(n_pairs, dtype=np.float64)

    for start in range(0, n_pairs, step):
        end = min(n_pairs, start + step)
        Xt = np.empty((end - start, 2), dtype=np.object)

        for k, (i, j) in enumerate(zip(all_i[start:end], all_j[start:end])):
            Xt[k, 0], Xt[k, 1] = X[i, 0], X[j, 0]

        Xt = distance_estimator.predict_proba(Xt)[:, 1]
        distances[start:end] = Xt[:]

    return distances
