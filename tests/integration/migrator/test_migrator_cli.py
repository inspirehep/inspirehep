# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import os

import pkg_resources
import pytest
from click.testing import CliRunner
from invenio_db import db
from mock import patch

from inspirehep.migrator.cli import migrate
from inspirehep.migrator.models import LegacyRecordsMirror
from inspirehep.migrator.tasks import populate_mirror_from_file


def test_migrate_file_halts_in_debug_mode(base_app, db, script_info):
    cli_runner = CliRunner()
    config = {"DEBUG": True}
    with patch.dict(base_app.config, config):
        file_name = pkg_resources.resource_filename(
            __name__, os.path.join("fixtures", "1663923.xml")
        )

        result = cli_runner.invoke(migrate, ["file", file_name], obj=script_info)

        assert result.exit_code == 1
        assert "DEBUG" in result.output


def test_migrate_file_doesnt_halt_in_debug_mode_when_forced(base_app, db, script_info):
    cli_runner = CliRunner()
    config = {"DEBUG": True}
    with patch.dict(base_app.config, config):
        file_name = pkg_resources.resource_filename(
            __name__, os.path.join("fixtures", "1663923.xml")
        )

        result = cli_runner.invoke(migrate, ["file", "-f", file_name], obj=script_info)

        assert result.exit_code == 0
        assert "DEBUG" not in result.output


def test_migrate_file(base_app, db, script_info, api_client):
    cli_runner = CliRunner()
    file_name = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1663923.xml")
    )

    result = cli_runner.invoke(
        migrate, ["file", "-w", "-f", file_name], obj=script_info
    )
    response = api_client.get("/literature/1663923")

    assert result.exit_code == 0
    assert response.status_code == 200
    assert json.loads(response.data)["metadata"]["control_number"] == 1663923


def test_migrate_file_mirror_only(script_info, db, api_client):
    cli_runner = CliRunner()
    file_name = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1663924.xml")
    )

    result = cli_runner.invoke(
        migrate, ["file", "-w", "-m", "-f", file_name], obj=script_info
    )
    prod_record = LegacyRecordsMirror.query.get(1663924)
    response = api_client.get("/literature/1663924")

    assert result.exit_code == 0
    assert prod_record.recid == 1663924
    assert response.status_code == 404


def test_migrate_mirror_halts_in_debug_mode(base_app, db, script_info):
    cli_runner = CliRunner()
    config = {"DEBUG": True}
    with patch.dict(base_app.config, config):
        result = cli_runner.invoke(migrate, ["mirror", "-a"], obj=script_info)

        assert result.exit_code == 1
        assert "DEBUG" in result.output


def test_migrate_mirror_doesnt_halt_in_debug_mode_when_forced(
    base_app, db, script_info
):
    cli_runner = CliRunner()
    config = {"DEBUG": True}
    with patch.dict(base_app.config, config):
        result = cli_runner.invoke(migrate, ["mirror", "-f"], obj=script_info)

        assert result.exit_code == 0
        assert "DEBUG" not in result.output


def test_migrate_mirror_migrates_pending(base_app, db, script_info, api_client):
    cli_runner = CliRunner()
    file_name = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1663924.xml")
    )
    populate_mirror_from_file(file_name)

    result = cli_runner.invoke(migrate, ["mirror", "-w", "-f"], obj=script_info)
    response = api_client.get("/literature/1663924")

    assert result.exit_code == 0
    assert response.status_code == 200
    assert json.loads(response.data)["metadata"]["control_number"] == 1663924


def test_migrate_mirror_broken_migrates_invalid(script_info, db, api_client):
    cli_runner = CliRunner()
    file_name = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1663927_broken.xml")
    )
    populate_mirror_from_file(file_name)

    result = cli_runner.invoke(migrate, ["mirror", "-w", "-f"], obj=script_info)
    response = api_client.get("/literature/1663927")

    assert result.exit_code == 0
    assert response.status_code == 404  # it's broken

    prod_record = LegacyRecordsMirror.query.get(1663927)
    prod_record.marcxml = prod_record.marcxml.replace(b"Not a date", b"2018")

    assert prod_record.valid is False

    db.session.merge(prod_record)

    result = cli_runner.invoke(migrate, ["mirror", "-w", "-f", "-b"], obj=script_info)
    response = api_client.get("/literature/1663927")

    assert result.exit_code == 0
    assert response.status_code == 200
    assert json.loads(response.data)["metadata"]["control_number"] == 1663927


@pytest.mark.xfail(
    reason="""Running this test in the full suite fails because other tests
    modify 2 records in the DB, but this test remigrates their original
    version, which fails ES indexing because of the version bug with the
    citation counts."""
)
def test_migrate_mirror_all_migrates_all(script_info, db, api_client):
    cli_runner = CliRunner()
    file_name = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1663924.xml")
    )
    populate_mirror_from_file(file_name)

    result = cli_runner.invoke(migrate, ["mirror", "-w", "-f"], obj=script_info)
    response = api_client.get("/literature/1663924")

    assert result.exit_code == 0
    assert response.status_code == 200

    prod_record = LegacyRecordsMirror.query.get(1663924)
    prod_record.marcxml = prod_record.marcxml.replace(
        "A Status report on", "A funny joke about"
    )

    assert prod_record.valid is True

    db.session.merge(prod_record)

    result = cli_runner.invoke(migrate, ["mirror", "-w", "-f", "-a"], obj=script_info)
    response = api_client.get("/literature/1663924")

    assert result.exit_code == 0
    assert response.status_code == 200
    assert (
        "A funny joke" in json.loads(response.data)["metadata"]["abstracts"][0]["value"]
    )
