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

from inspire_disambiguation.core.data_models import Signature
from inspire_disambiguation.core.data_models.publication import Publication


@pytest.fixture(scope="function")
def curated_signature():
    signature = Signature(
        author_affiliation="Rutgers U., Piscataway",
        author_id=989440,
        author_name="Seiberg, Nana",
        publication=Publication(
            abstract="abstract",
            authors=["Seiberg, N.", "Jimmy"],
            collaborations=["ATLAS", "CMS"],
            keywords=["effective action", "approximation: semiclassical"],
            publication_id=374836,
            title="Title",
            topics=["Theory-HEP", "Physics"],
        ),
        signature_block="SABARGn",
        signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
        is_curated_author_id=True
    )
    return signature


@pytest.fixture(scope="function")
def non_curated_signature():
    signature = Signature(
        author_affiliation="Texas U.",
        author_id=None,
        author_name="Weinberg, Steven",
        publication=Publication(
            abstract="Author not curated",
            authors=["Weinberg, Steven"],
            collaborations=[],
            keywords=["book"],
            publication_id=406190,
            title="The Quantum theory of fields. Vol. 1: Foundations",
            topics=["Theory-HEP", "General Physics"],
        ),
        signature_block="WANBARGs",
        signature_uuid="5e550ded-e955-4a22-b906-8af5aaa9f1e2",
        is_curated_author_id=False,
    )
    return signature


@pytest.fixture(scope="function")
def curated_author():
    return {
        "full_name": "Doe, John",
        "curated_relation": True,
        "record": {"$ref": "http://labs.inspirehep.net/api/authors/989441"},
        "affiliations": [{"value": "Rutgers U., Piscataway"}],
        "signature_block": "JOhn",
        "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
    }


@pytest.fixture(scope="function")
def non_curated_author():
    return {
        "full_name": "Doe, John",
        "affiliations": [{"value": "Rutgers U., Piscataway"}],
        "signature_block": "JOhn",
        "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
    }


@pytest.fixture(scope="function")
def non_curated_author_with_recid():
    return {
        "full_name": "Doe, John",
        "affiliations": [{"value": "Rutgers U., Piscataway"}],
        "record": {"$ref": "http://labs.inspirehep.net/api/authors/989441"},
        "signature_block": "JOhn",
        "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
    }


@pytest.fixture(scope="function")
def record():
    with open("tests/data/374837.json", "r") as f:
        record = json.load(f)
    return record
