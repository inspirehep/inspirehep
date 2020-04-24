# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import random

from helpers.utils import create_record_factory, override_config
from invenio_search import current_search
from invenio_search.utils import build_index_name

from inspirehep.search.api import (
    AuthorsSearch,
    ConferencesSearch,
    JobsSearch,
    LiteratureSearch,
)


def test_reindex_all_types_records(inspire_app, cli):
    record_lit = create_record_factory("lit")
    record_aut = create_record_factory("aut")
    record_job = create_record_factory("job")
    record_con = create_record_factory("con")

    result = cli.invoke(["index", "reindex", "--all"])
    current_search.flush_and_refresh("*")
    results_lit_uuid = LiteratureSearch().execute().hits.hits[0]["_id"]
    results_aut_uuid = AuthorsSearch().execute().hits.hits[0]["_id"]
    results_con_uuid = ConferencesSearch().execute().hits.hits[0]["_id"]
    results_job_uuid = JobsSearch().execute().hits.hits[0]["_id"]

    assert str(record_lit.id) == results_lit_uuid
    assert str(record_aut.id) == results_aut_uuid
    assert str(record_con.id) == results_con_uuid
    assert str(record_job.id) == results_job_uuid


def test_reindex_one_type_of_record(inspire_app, cli):
    record_lit = create_record_factory("lit")
    record_aut = create_record_factory("aut")

    result = cli.invoke(["index", "reindex", "-p", "lit"])
    current_search.flush_and_refresh("*")
    expected_aut_len = 0
    results_lit_uuid = LiteratureSearch().execute().hits.hits[0]["_id"]
    results_aut_len = len(AuthorsSearch().execute().hits.hits)

    assert str(record_lit.id) == results_lit_uuid
    assert expected_aut_len == results_aut_len


def test_remap_one_index(inspire_app, cli):
    indexes_before = set(current_search.client.indices.get("*").keys())
    # Generate new suffix to distinguish new indexes easier
    current_search._current_suffix = f"-{random.getrandbits(64)}"
    result = cli.invoke(["index", "remap", "--index", "records-hep", "--yes-i-know"])
    current_search.flush_and_refresh("*")
    assert result.exit_code == 0
    indexes_after = set(current_search.client.indices.get("*").keys())
    difference = indexes_after - indexes_before
    assert len(difference) == 1
    assert "records-hep" in difference.pop()
    current_search._current_suffix = None


def test_remap_two_indexex(inspire_app, cli):
    indexes_before = set(current_search.client.indices.get("*").keys())
    current_search._current_suffix = f"-{random.getrandbits(64)}"
    result = cli.invoke(
        [
            "index",
            "remap",
            "--index",
            "records-data",
            "--index",
            "records-authors",
            "--yes-i-know",
        ]
    )
    current_search.flush_and_refresh("*")

    assert result.exit_code == 0
    indexes_after = set(current_search.client.indices.get("*").keys())
    difference = sorted(list(indexes_after - indexes_before))

    assert len(difference) == 2
    assert build_index_name("records-authors") == difference[0]
    assert build_index_name("records-data") == difference[1]

    current_search._current_suffix = None


def test_remap_index_with_wrong_name(inspire_app, cli):
    current_search._current_suffix = f"-{random.getrandbits(64)}"

    indexes_before = set(current_search.client.indices.get("*").keys())
    result = cli.invoke(["index", "remap", "--index", "records-author", "--yes-i-know"])
    current_search.flush_and_refresh("*")

    assert result.exit_code == 1
    indexes_after = set(current_search.client.indices.get("*").keys())
    difference = sorted(indexes_after - indexes_before)
    assert len(difference) == 0

    current_search._current_suffix = None


def test_remap_index_which_is_missing_in_es(inspire_app, cli):
    config = {"SEARCH_INDEX_PREFIX": f"{random.getrandbits(64)}-"}
    with override_config(**config):
        indexes_before = set(current_search.client.indices.get("*").keys())
        result = cli.invoke(
            ["index", "remap", "--index", "records-authors", "--yes-i-know"]
        )
    current_search.flush_and_refresh("*")

    assert result.exit_code == 1
    indexes_after = set(current_search.client.indices.get("*").keys())
    difference = sorted(indexes_after - indexes_before)
    assert len(difference) == 0

    list(current_search.delete("*"))
    current_search._current_suffix = None


def test_remap_index_which_is_missing_in_es_but_ignore_checks(inspire_app, cli):
    config = {"SEARCH_INDEX_PREFIX": f"{random.getrandbits(64)}-"}
    with override_config(**config):
        indexes_before = set(current_search.client.indices.get("*").keys())
        result = cli.invoke(
            [
                "index",
                "remap",
                "--index",
                "records-authors",
                "--yes-i-know",
                "--ignore-checks",
            ]
        )
    current_search.flush_and_refresh("*")

    assert result.exit_code == 0
    indexes_after = set(current_search.client.indices.get("*").keys())
    difference = sorted(indexes_after - indexes_before)
    assert len(difference) == 1
    with override_config(**config):
        assert build_index_name("records-authors") == difference[0]

    list(current_search.delete("*"))
    current_search._current_suffix = None


def test_remap_index_when_there_are_more_than_one_indexes_with_same_name_but_different_postfix(
    inspire_app, cli
):
    current_search._current_suffix = f"-{random.getrandbits(64)}"
    list(current_search.create(ignore_existing=True, index_list="records-data"))
    current_search._current_suffix = f"-{random.getrandbits(64)}"
    indexes_before = set(current_search.client.indices.get("*").keys())
    result = cli.invoke(["index", "remap", "--index", "records-data", "--yes-i-know"])
    current_search.flush_and_refresh("*")

    assert result.exit_code == 1
    indexes_after = set(current_search.client.indices.get("*").keys())
    difference = sorted(indexes_after - indexes_before)
    assert len(difference) == 0

    list(current_search.delete("*"))
    current_search._current_suffix = None


def test_remap_index_when_there_are_more_than_one_indexes_with_same_name_but_different_postfix_ignore_checks(
    inspire_app, cli
):
    current_search._current_suffix = f"-{random.getrandbits(64)}"
    list(current_search.create(ignore_existing=True, index_list="records-data"))
    current_search._current_suffix = f"-{random.getrandbits(64)}"
    indexes_before = set(current_search.client.indices.get("*").keys())
    result = cli.invoke(
        ["index", "remap", "--index", "records-data", "--yes-i-know", "--ignore-checks"]
    )
    current_search.flush_and_refresh("*")

    assert result.exit_code == 0
    indexes_after = set(current_search.client.indices.get("*").keys())
    difference = sorted(indexes_after - indexes_before)

    assert len(difference) == 1

    list(current_search.delete("*"))
    current_search._current_suffix = None
