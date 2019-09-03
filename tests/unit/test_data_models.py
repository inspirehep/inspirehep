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
from inspire_disambiguation.core.data_models import Signature
from inspire_disambiguation.core.data_models.publication import (
    Publication,
    PublicationCache
)


def test_build_publication(record):
    result = Publication.build(record)
    expected_result = Publication(
        abstract="2 curated authors with recid",
        authors=["Doe, John"],
        collaborations=["ATLAS"],
        keywords=["effective action", "approximation: semiclassical"],
        publication_id=374836,
        title="Title",
        topics=["Theory-HEP"],
    )
    assert result == expected_result


def test_publication_cache(record):
    record
    publication1 = PublicationCache.build(1, record=record)
    publication2 = PublicationCache.build(1, record=record)
    assert publication1 is publication2


def test_build_signature_with_curated_author(curated_author, record):
    result = Signature.build(curated_author, record)
    expected_result = Signature(
        author_affiliation="Rutgers U., Piscataway",
        author_id=989441,
        author_name="Doe, John",
        publication=Publication(
            abstract="2 curated authors with recid",
            authors=["Doe, John"],
            collaborations=["ATLAS"],
            keywords=["effective action", "approximation: semiclassical"],
            publication_id=374836,
            title="Title",
            topics=["Theory-HEP"],
        ),
        signature_block="JOhn",
        signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
        is_curated_author_id=True,
    )
    assert result == expected_result


def test_build_signature_uses_publication_cache(curated_author, record):
    Signature.build(curated_author, record)
    assert record["control_number"] in PublicationCache.cache


def test_build_signature_with_non_curated_author(non_curated_author, record):
    result = Signature.build(non_curated_author, record)
    expected_result = Signature(
        author_affiliation="Rutgers U., Piscataway",
        author_id=None,
        author_name="Doe, John",
        publication=Publication(
            abstract="2 curated authors with recid",
            authors=["Doe, John"],
            collaborations=["ATLAS"],
            keywords=["effective action", "approximation: semiclassical"],
            publication_id=374836,
            title="Title",
            topics=["Theory-HEP"],
        ),
        signature_block="JOhn",
        signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
        is_curated_author_id=False,
    )
    assert result == expected_result


def test_build_signature_with_non_curated_author_with_recid(
    non_curated_author_with_recid, record
):
    result = Signature.build(non_curated_author_with_recid, record)
    expected_result = Signature(
        author_affiliation="Rutgers U., Piscataway",
        author_id=989441,
        author_name="Doe, John",
        publication=Publication(
            abstract="2 curated authors with recid",
            authors=["Doe, John"],
            collaborations=["ATLAS"],
            keywords=["effective action", "approximation: semiclassical"],
            publication_id=374836,
            title="Title",
            topics=["Theory-HEP"],
        ),
        signature_block="JOhn",
        signature_uuid="94fc2b0a-dc17-42c2-bae3-ca0024079e52",
        is_curated_author_id=False,
    )
    assert result == expected_result


def test_build_many_signatures_with_one_publication(
    non_curated_author, curated_author, record
):
    signature1 = Signature.build(non_curated_author, record=record)
    signature2 = Signature.build(curated_author, record=record)
    assert signature1.publication is signature2.publication
