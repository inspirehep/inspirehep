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

import pytest
import json


from inspire_disambiguation.api import train_and_save_ethnicity_model

ETHNICITY_TRAINING_DATA = """\
RACE,NAMELAST,NAMEFRST
1,Doe,John
2,Lee,Stan
3,Abdullah,FOO
4,Montana,Hannah
5,Doe,Jane
"""


class FakeHit(dict):
    def to_dict(self):
        return self


def load_es_record(filename):
    with open(f"tests/data/{filename}.json", "r") as f:
        record = json.load(f)
    return FakeHit(record)


@pytest.fixture(scope="function")
def es_record_with_2_curated_authors():
    return load_es_record("374836")


@pytest.fixture(scope="function")
def es_record_with_curated_author():
    return load_es_record("374837")


@pytest.fixture(scope="function")
def es_record_with_curated_author_and_no_recid():
    return load_es_record("406190")


@pytest.fixture(scope="function")
def es_record_with_non_curated_author():
    return load_es_record("421404")


@pytest.fixture(scope="function")
def es_record_with_many_curated_authors():
    return load_es_record("1")


@pytest.fixture(scope="function")
def ethnicity_path(tmpdir):
    ethnicity_data_path = tmpdir.join("ethnicity.csv")
    ethnicity_data_path.write(ETHNICITY_TRAINING_DATA)
    ethnicity_model_path = tmpdir.join("ethnicity.pkl")
    train_and_save_ethnicity_model(ethnicity_data_path, ethnicity_model_path)
    return ethnicity_model_path
