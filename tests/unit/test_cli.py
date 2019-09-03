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
from click.testing import CliRunner

from inspire_disambiguation import conf
from inspire_disambiguation.cli import cli


@patch("inspire_disambiguation.cli.train_and_save_ethnicity_model")
def test_ethnicity_model_cli_function_default_params(
    train_and_save_ethnicity_model_mock
):
    runner = CliRunner()
    runner.invoke(cli, ["train", "ethnicity-model"])
    train_and_save_ethnicity_model_mock.assert_called_with(
        conf["ETHNICITY_DATA_PATH"], conf["ETHNICITY_MODEL_PATH"]
    )


@patch("inspire_disambiguation.cli.train_and_save_ethnicity_model")
def test_ethnicity_model_cli_function_provided_params(
    train_and_save_ethnicity_model_mock
):
    runner = CliRunner()
    runner.invoke(
        cli, ["train", "ethnicity-model", "-l", "data_path", "-s", "model_path"]
    )
    train_and_save_ethnicity_model_mock.assert_called_with("data_path", "model_path")


@patch("inspire_disambiguation.cli.train_and_save_distance_model")
def test_distance_model_cli_function_default_params(train_and_save_distance_model_mock):
    runner = CliRunner()
    runner.invoke(cli, ["train", "distance-model"])
    train_and_save_distance_model_mock.assert_called_with(
        conf["ETHNICITY_MODEL_PATH"],
        conf["DISTANCE_MODEL_PATH"],
        conf["SAMPLED_PAIRS_SIZE"],
    )


@patch("inspire_disambiguation.cli.train_and_save_distance_model")
def test_distance_model_cli_function_provided_params(
    train_and_save_distance_model_mock
):
    runner = CliRunner()
    runner.invoke(
        cli,
        [
            "train",
            "distance-model",
            "-e",
            "ethnicity_model",
            "-s",
            "distance_model",
            "-p",
            12,
        ],
    )
    train_and_save_distance_model_mock.assert_called_with(
        "ethnicity_model", "distance_model", 12
    )


@patch("inspire_disambiguation.cli.cluster_from_redis")
def test_cluster_cli_function_default_params(cluster_from_redis_mock):
    runner = CliRunner()
    runner.invoke(cli, ["cluster"])
    cluster_from_redis_mock.assert_called_with(
        conf["ETHNICITY_MODEL_PATH"],
        conf["DISTANCE_MODEL_PATH"],
        conf["CLUSTERING_N_JOBS"],
    )


@patch("inspire_disambiguation.cli.cluster_from_redis")
def test_cluster_cli_function_provided_params(cluster_from_redis_mock):
    runner = CliRunner()
    runner.invoke(
        cli, ["cluster", "-e", "ethnicity_model", "-d", "distance_model", "-j", 8]
    )
    cluster_from_redis_mock.assert_called_with("ethnicity_model", "distance_model", 8)
