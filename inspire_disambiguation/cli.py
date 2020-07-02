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

import click
from inspire_disambiguation import conf
from inspire_disambiguation.api import (
    train_and_save_ethnicity_model,
    train_and_save_distance_model,
    cluster_from_redis,
)


@click.group()
def cli():
    pass


@cli.group()
def train():
    """Training commands for ethnicity model and distance model."""
    pass


@train.command()
@click.option(
    "-l",
    "--load",
    "load_data_path",
    default=conf["ETHNICITY_DATA_PATH"],
    help=f"Path to ethnicity csv file. (default: '{conf['ETHNICITY_DATA_PATH']}')",
)
@click.option(
    "-s",
    "--save",
    "save_model_path",
    default=conf["ETHNICITY_MODEL_PATH"],
    help=f"Path for saving ethnicity model."
    f"(default: '{conf['ETHNICITY_MODEL_PATH']})'",
    type=str,
)
def ethnicity_model(load_data_path, save_model_path):
    """Train ethnicity model and save it."""
    click.secho("Starting ETHNICITY training.")
    click.secho("This will take a while.")
    train_and_save_ethnicity_model(load_data_path, save_model_path)
    click.secho(f"Done. Model saved in {save_model_path}", fg="green")


@train.command()
@click.option(
    "-e",
    "--ethnicity",
    "ethnicity_model_path",
    default=conf["ETHNICITY_MODEL_PATH"],
    help=f"Path to ethnicity model obtained after training on ethnicity data."
    f"(default: '{conf['ETHNICITY_MODEL_PATH']}')",
    type=str,
)
@click.option(
    "-s",
    "--save",
    "save_model_path",
    default=conf["DISTANCE_MODEL_PATH"],
    help=f"Path for saving distance model. (default: {conf['DISTANCE_MODEL_PATH']}')",
    type=str,
)
@click.option(
    "-p",
    "--pairs_size",
    "sampled_pairs_size",
    default=conf["SAMPLED_PAIRS_SIZE"],
    help=f"Size of sampled pairs. Has to be multiple of 12."
    f"(default:'{conf['SAMPLED_PAIRS_SIZE']}')",
    type=int,
)
@click.option(
    "-t",
    "--test",
    help=f"Test model performance on a test set.",
    is_flag=True,
)
@click.option(
    "-f",
    "--train_fraction",
    help=f"Fraction of training samples in dataset.",
    default=0.8,
    type=float,
)
@click.option(
    "-j",
    "--n_jobs",
    "n_jobs",
    default=conf["CLUSTERING_N_JOBS"],
    help=f"Number of processes to use. (default: '{conf['CLUSTERING_N_JOBS']}')",
    type=int,
)
def distance_model(ethnicity_model_path, save_model_path,
                   sampled_pairs_size, test, train_fraction, n_jobs):
    """Train distance model and save it."""
    click.secho("Starting Distance training.")
    test_signatures = train_and_save_distance_model(
            ethnicity_model_path, save_model_path, sampled_pairs_size,
            train_fraction)
    if test:
        cluster(ethnicity_model_path, save_model_path, n_jobs, test_signatures)
    click.secho(f"Done. Model saved in {save_model_path}", fg="green")


@cli.command()
@click.option(
    "-e",
    "--ethnicity",
    "ethnicity_model_path",
    default=conf["ETHNICITY_MODEL_PATH"],
    help=f"Path to ethnicity model obtained after training on ethnicity data."
    f"(default: '{conf['ETHNICITY_MODEL_PATH']}')",
    type=str,
)
@click.option(
    "-d",
    "--distance",
    "distance_model_path",
    default=conf["DISTANCE_MODEL_PATH"],
    help=f"Path to distance model. (default: '{conf['DISTANCE_MODEL_PATH']}')",
    type=str,
)
@click.option(
    "-j",
    "--n_jobs",
    "n_jobs",
    default=conf["CLUSTERING_N_JOBS"],
    help=f"Number of processes to use. (default: '{conf['CLUSTERING_N_JOBS']}')",
    type=int,
)
def cluster(ethnicity_model_path, distance_model_path, n_jobs):
    """Cluster data for signature_blocks stored in redis"""
    click.secho("Starting clustering.")
    cluster_from_redis(ethnicity_model_path, distance_model_path, n_jobs)
    click.secho("Done.", fg="green")
