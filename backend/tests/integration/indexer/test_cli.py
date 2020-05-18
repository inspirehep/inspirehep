# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import random

from celery import current_app
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


def _test_alias_to_index(alias_name, expected_index_name):
    index_info = current_search.client.indices.get_alias(name=alias_name)
    indexes = list(index_info)
    assert len(indexes) == 1
    assert expected_index_name in indexes[0]


def test_cli_create_aliases(inspire_app, cli):
    prefix = "test-cli-create-aliases-prefix-"
    with override_config(SEARCH_INDEX_PREFIX=prefix):
        list(current_search.create(ignore_existing=True))
        result = cli.invoke(["index", "create-aliases", "--yes-i-know"])
    assert result.exit_code == 0
    assert (
        result.output
        != "This command can be executed only if SEARCH_INDEX_PREFIX is set.\n"
    )
    assert "does not contain current prefix" in result.output

    aliases = []
    for x in current_search.client.indices.get_alias().values():
        aliases.extend(x["aliases"].keys())

    assert "records-hep" in aliases
    assert "records-authors" in aliases
    assert "records-seminars" in aliases
    assert "records-jobs" in aliases
    assert "records-institutions" in aliases
    assert "records-journals" in aliases
    assert "records-data" in aliases
    assert "records-experiments" in aliases
    assert "records-conferences" in aliases

    _test_alias_to_index("records-hep", "test-cli-create-aliases-prefix-records-hep")
    _test_alias_to_index(
        "records-authors", "test-cli-create-aliases-prefix-records-authors"
    )
    _test_alias_to_index(
        "records-seminars", "test-cli-create-aliases-prefix-records-seminars"
    )
    _test_alias_to_index("records-jobs", "test-cli-create-aliases-prefix-records-jobs")
    _test_alias_to_index(
        "records-institutions", "test-cli-create-aliases-prefix-records-institutions"
    )
    _test_alias_to_index(
        "records-journals", "test-cli-create-aliases-prefix-records-journals"
    )
    _test_alias_to_index("records-data", "test-cli-create-aliases-prefix-records-data")
    _test_alias_to_index(
        "records-experiments", "test-cli-create-aliases-prefix-records-experiments"
    )
    _test_alias_to_index(
        "records-conferences", "test-cli-create-aliases-prefix-records-conferences"
    )

    current_search.flush_and_refresh("*")
    current_search.client.indices.delete_alias(f"{prefix}*", "*")


def test_cli_create_aliases_stops_if_prefix_not_set(inspire_app, cli):
    with override_config(SEARCH_INDEX_PREFIX=""):
        result = cli.invoke(["index", "create-aliases"])
    assert (
        result.output
        == "This command can be executed only if SEARCH_INDEX_PREFIX is set.\n"
    )


def test_cli_create_prefixed_aliases(inspire_app, cli):
    prefix = "test-cli-create-aliases-prefix-"
    with override_config(SEARCH_INDEX_PREFIX=prefix):
        list(current_search.create(ignore_existing=True))
        result = cli.invoke(
            [
                "index",
                "create-aliases",
                "--yes-i-know",
                "--prefix-alias",
                "test-alias-prefix-",
            ]
        )
    assert result.exit_code == 0
    assert (
        result.output
        != "This command can be executed only if SEARCH_INDEX_PREFIX is set.\n"
    )
    assert "does not contain current prefix" in result.output

    aliases = []
    for x in current_search.client.indices.get_alias().values():
        aliases.extend(x["aliases"].keys())

    assert "test-alias-prefix-records-hep" in aliases
    assert "test-alias-prefix-records-authors" in aliases
    assert "test-alias-prefix-records-seminars" in aliases
    assert "test-alias-prefix-records-jobs" in aliases
    assert "test-alias-prefix-records-institutions" in aliases
    assert "test-alias-prefix-records-journals" in aliases
    assert "test-alias-prefix-records-data" in aliases
    assert "test-alias-prefix-records-experiments" in aliases
    assert "test-alias-prefix-records-conferences" in aliases

    _test_alias_to_index(
        "test-alias-prefix-records-hep", "test-cli-create-aliases-prefix-records-hep"
    )
    _test_alias_to_index(
        "test-alias-prefix-records-authors",
        "test-cli-create-aliases-prefix-records-authors",
    )
    _test_alias_to_index(
        "test-alias-prefix-records-seminars",
        "test-cli-create-aliases-prefix-records-seminars",
    )
    _test_alias_to_index(
        "test-alias-prefix-records-jobs", "test-cli-create-aliases-prefix-records-jobs"
    )
    _test_alias_to_index(
        "test-alias-prefix-records-institutions",
        "test-cli-create-aliases-prefix-records-institutions",
    )
    _test_alias_to_index(
        "test-alias-prefix-records-journals",
        "test-cli-create-aliases-prefix-records-journals",
    )
    _test_alias_to_index(
        "test-alias-prefix-records-data", "test-cli-create-aliases-prefix-records-data"
    )
    _test_alias_to_index(
        "test-alias-prefix-records-experiments",
        "test-cli-create-aliases-prefix-records-experiments",
    )
    _test_alias_to_index(
        "test-alias-prefix-records-conferences",
        "test-cli-create-aliases-prefix-records-conferences",
    )

    current_search.flush_and_refresh("*")
    current_search.client.indices.delete_alias(f"{prefix}*", "*")
