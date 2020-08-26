# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
import pytest

from inspirehep.pidstore.errors import CannotGenerateUniqueTexKey
from inspirehep.pidstore.providers.texkey import InspireTexKeyProvider


def test_sanitize():
    name = "ZażółcićGęśląJaźń_12!@#$ baba-jaga"
    expected_sanitazed_name = "ZazolcicGeslaJazn12baba-jaga"
    sanitazed_name = InspireTexKeyProvider.sanitize(name)
    assert sanitazed_name == expected_sanitazed_name


def test_get_texkey_first_part_when_authors_les_than_10():
    data = {"authors": [{"full_name": "Kirk , James T."}, {"Janeway, Kathryn"}]}

    expected_texkey_part = "Kirk"
    texkey_part = InspireTexKeyProvider.build_texkey_first_part(data)
    assert texkey_part == expected_texkey_part


def test_get_texkey_first_part_when_authors_more_than_10():
    data = {
        "authors": [
            {"full_name": "Kirk , James T."},
            {"full_name": "Janeway, Kathryn"},
            {"full_name": "Picard, Jean-Luc"},
            {"full_name": "Sisko, Benjamin"},
            {"full_name": "Archer, Jonathan"},
            {"full_name": "Georgiou, Philippa"},
            {"full_name": "Lorca, Gabriel"},
            {"full_name": "Pike, Christopher"},
            {"full_name": "Sulu, Hikaru"},
            {"full_name": "La Forge, Geordi"},
            {"full_name": "Paris, Owen"},
        ],
        "collaborations": [{"value": "CMS"}],
    }

    expected_texkey_part = "CMS"
    texkey_part = InspireTexKeyProvider.build_texkey_first_part(data)
    assert texkey_part == expected_texkey_part


def test_get_texkey_first_part_when_authors_more_than_10_and_no_ther_source_for_first_part():
    data = {
        "authors": [
            {"full_name": "Kirk , James T."},
            {"full_name": "Janeway, Kathryn"},
            {"full_name": "Picard, Jean-Luc"},
            {"full_name": "Sisko, Benjamin"},
            {"full_name": "Archer, Jonathan"},
            {"full_name": "Georgiou, Philippa"},
            {"full_name": "Lorca, Gabriel"},
            {"full_name": "Pike, Christopher"},
            {"full_name": "Sulu, Hikaru"},
            {"full_name": "La Forge, Geordi"},
            {"full_name": "Paris, Owen"},
        ],
        "document_type": ["book"],
    }

    expected_texkey_part = "Kirk"
    texkey_part = InspireTexKeyProvider.build_texkey_first_part(data)
    assert texkey_part == expected_texkey_part


def test_get_texkey_first_part_when_no_authors():
    data = {"collaborations": [{"value": "CMS"}]}

    expected_texkey_part = "CMS"
    texkey_part = InspireTexKeyProvider.build_texkey_first_part(data)
    assert texkey_part == expected_texkey_part


def test_get_texkey_first_part_for_corporate_author():
    data = {"corporate_author": ["Some Author"]}

    expected_texkey_part = "SomeAuthor"
    texkey_part = InspireTexKeyProvider.build_texkey_first_part(data)
    assert texkey_part == expected_texkey_part


def test_get_texkey_first_part_for_proceedings():
    data = {"document_type": ["proceedings"]}

    expected_texkey_part = "Proceedings"
    texkey_part = InspireTexKeyProvider.build_texkey_first_part(data)
    assert texkey_part == expected_texkey_part


def test_get_texkey_first_part_for_more_than_10_authors_and_other_fields_are_empty():
    data = {
        "authors": [
            {"full_name": "Kirk , James T."},
            {"full_name": "Janeway, Kathryn"},
            {"full_name": "Picard, Jean-Luc"},
            {"full_name": "Sisko, Benjamin"},
            {"full_name": "Archer, Jonathan"},
            {"full_name": "Georgiou, Philippa"},
            {"full_name": "Lorca, Gabriel"},
            {"full_name": "Pike, Christopher"},
            {"full_name": "Sulu, Hikaru"},
            {"full_name": "La Forge, Geordi"},
            {"full_name": "Paris, Owen"},
        ],
        "document_type": ["Article"],
    }

    expected_texkey_part = "Kirk"
    texkey_part = InspireTexKeyProvider.build_texkey_first_part(data)
    assert texkey_part == expected_texkey_part


def test_get_texkey_second_part():
    data = {"preprint_date": 1999}

    expected_secod_part = "1999"
    second_part = InspireTexKeyProvider.build_texkey_second_part(data)
    assert second_part == expected_secod_part


def test_get_random_texkey_part():
    texkey = "Janeway:2345"
    with mock.patch(
        "inspirehep.pidstore.providers.texkey.current_app"
    ) as mocked_app, mock.patch(
        "inspirehep.pidstore.providers.texkey.PersistentIdentifier"
    ) as model_mock:
        mocked_app.config = {
            "PIDSTORE_TEXKEY_MAX_RETRY_COUNT": 5,
            "PIDSTORE_TEXKEY_RANDOM_PART_SIZE": 3,
        }
        model_mock.query.return_value.filter.return_value.filter.return_value.one_or_none.return_value = (
            None
        )

        second_part = InspireTexKeyProvider.get_texkey_with_random_part(texkey)

        assert second_part.startswith(texkey)
        assert len(second_part) == len(texkey) + 3


def test_get_random_texkey_retries_count_taken_from_config():
    texkey = "Janeway:2345"
    random_part = "ax1"
    with mock.patch(
        "inspirehep.pidstore.providers.texkey.current_app"
    ) as mocked_app, mock.patch(
        "inspirehep.pidstore.providers.texkey.PersistentIdentifier"
    ) as model_mock, mock.patch(
        "inspirehep.pidstore.providers.texkey.random"
    ) as mocked_random:
        mocked_app.config = {
            "PIDSTORE_TEXKEY_MAX_RETRY_COUNT": 2,
            "PIDSTORE_TEXKEY_RANDOM_PART_SIZE": 3,
        }
        model_mock.query.with_entities.return_value.filter.return_value.filter.return_value = [
            [texkey + random_part]
        ]
        mocked_random.choices.return_value = ["a", "x", "1"]
        with pytest.raises(CannotGenerateUniqueTexKey):
            InspireTexKeyProvider.get_texkey_with_random_part(texkey)
        assert mocked_random.choices.call_count == 2


def test_get_random_texkey_part_length_taken_from_config():
    texkey = "Janeway:2345"
    with mock.patch(
        "inspirehep.pidstore.providers.texkey.current_app"
    ) as mocked_app, mock.patch(
        "inspirehep.pidstore.providers.texkey.PersistentIdentifier"
    ) as model_mock:
        mocked_app.config = {
            "PIDSTORE_TEXKEY_MAX_RETRY_COUNT": 5,
            "PIDSTORE_TEXKEY_RANDOM_PART_SIZE": 9,
        }
        model_mock.query.return_value.filter.return_value.filter.return_value.one_or_none.return_value = (
            None
        )

        second_part = InspireTexKeyProvider.get_texkey_with_random_part(texkey)

        assert second_part.startswith(texkey)
        assert len(second_part) == len(texkey) + 9
