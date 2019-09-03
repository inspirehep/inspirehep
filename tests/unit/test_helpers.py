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
from inspire_disambiguation.core.helpers import (
    CachedObject,
    get_author_affiliation,
    get_author_id,
    get_authors_full_names,
    get_recid_from_ref,
    get_first_initial,
    load_signatures,
    get_author_full_name,
    get_second_initial,
    get_first_given_name,
    get_second_given_name,
    get_author_other_names,
    get_coauthors_neighborhood,
    get_abstract,
    get_keywords,
    get_collaborations,
    get_topics,
    get_title,
    group_by_signature,
    get_normalized_affiliation,
)


def test_get_author_affiliation(curated_author):
    result = get_author_affiliation(curated_author)
    expected_result = "Rutgers U., Piscataway"
    assert result == expected_result


def test_get_author_id(curated_author):
    result = get_author_id(curated_author)
    expected_result = 989441
    assert result == expected_result


def test_get_recid_from_ref_returns_none_on_none():
    assert get_recid_from_ref(None) is None


def test_get_recid_from_ref_returns_none_on_simple_strings():
    assert get_recid_from_ref("a_string") is None


def test_get_recid_from_ref_returns_none_on_empty_object():
    assert get_recid_from_ref({}) is None


def test_get_recid_from_ref_returns_none_on_object_with_wrong_key():
    assert get_recid_from_ref({"bad_key": "some_val"}) is None


def test_get_recid_from_ref_returns_none_on_ref_a_simple_string():
    assert get_recid_from_ref({"$ref": "a_string"}) is None


def test_get_recid_from_ref_returns_none_on_ref_malformed():
    assert get_recid_from_ref({"$ref": "http://bad_url"}) is None


def test_get_recid_from_ref():
    assert get_recid_from_ref({"$ref": "http://labs.inspirehep.net/api/authors/2"}) == 2


def test_get_authors_full_names(record):
    result = get_authors_full_names(record)
    expected_result = ["Doe, John"]
    assert result == expected_result


def test_cached_object():
    class SomeClass(object):
        def __init__(self, arg1, arg2):
            self.arg1 = arg1
            self.arg2 = arg2

        @classmethod
        def factory(cls, arg1, arg2):
            return cls(arg1, arg2)

    class SomeClassCached(CachedObject):
        object_factory = SomeClass.factory

    obj1 = SomeClassCached.build(1, arg1=1, arg2=2)
    obj2 = SomeClassCached.build(2, arg1=3, arg2=4)
    obj3 = SomeClassCached.build(1, arg1=1, arg2=2)

    assert obj1 is obj3
    assert obj1 is not obj2


def test_load_signatures(curated_signature, non_curated_signature):
    signatures_by_uuid = load_signatures([curated_signature, non_curated_signature])
    expected_signatures_by_uuid = {
        curated_signature["signature_uuid"]: curated_signature,
        non_curated_signature["signature_uuid"]: non_curated_signature,
    }
    assert signatures_by_uuid == expected_signatures_by_uuid


def test_get_author_full_name(curated_signature):
    result = get_author_full_name(curated_signature)
    expected_result = "seiberg nana"
    assert result == expected_result


def test_get_first_initial(curated_signature):
    result = get_first_initial(curated_signature)
    expected_result = "n"
    assert result == expected_result


def test_get_first_initial_with_no_first_name(curated_signature):
    curated_signature.author_name = ""
    result = get_first_initial(curated_signature)
    assert result == ""


def test_get_second_initial_with_second_name(curated_signature):
    curated_signature.author_name = "Seiberg, Nana Beard"
    result = get_second_initial(curated_signature)
    expected_result = "b"
    assert result == expected_result


def test_get_second_initial_without_second_name(curated_signature):
    result = get_second_initial(curated_signature)
    assert result == ""


def test_get_first_given_name(curated_signature):
    result = get_first_given_name(curated_signature)
    expected_result = "Nana"
    assert result == expected_result


def test_get_second_given_name(curated_signature):
    curated_signature.author_name = "Seiberg, Nana Beard"
    result = get_second_given_name(curated_signature)
    expected_result = "Beard"
    assert result == expected_result


def test_get_author_other_names(curated_signature):
    curated_signature.author_name = "Seiberg, Nana Beard"
    result = get_author_other_names(curated_signature)
    expected_result = "beard nana"
    assert result == expected_result


def test_get_normalized_affiliation(curated_signature):
    result = get_normalized_affiliation(curated_signature)
    expected_result = "rutgersu piscataway"
    assert result == expected_result


def test_authors_neighborhood(curated_signature):
    result = get_coauthors_neighborhood(curated_signature)
    expected_result = "Seiberg, N. Jimmy"
    assert result == expected_result


def test_get_abstract(curated_signature):
    result = get_abstract(curated_signature)
    expected_result = "abstract"
    assert result == expected_result


def test_get_keywords(curated_signature):
    result = get_keywords(curated_signature)
    expected_result = "effective action approximation: semiclassical"
    assert result == expected_result


def test_get_collaborations(curated_signature):
    result = get_collaborations(curated_signature)
    expected_result = "ATLAS CMS"
    assert result == expected_result


def test_get_topics(curated_signature):
    result = get_topics(curated_signature)
    expected_result = "Theory-HEP Physics"
    assert result == expected_result


def test_get_title(curated_signature):
    result = get_title(curated_signature)
    expected_result = "Title"
    assert result == expected_result


def test_group_by_signature(curated_signature, non_curated_signature):
    result = group_by_signature([curated_signature, non_curated_signature])
    expected_result = "94fc2b0a-dc17-42c2-bae3-ca0024079e52"
    assert result == expected_result
