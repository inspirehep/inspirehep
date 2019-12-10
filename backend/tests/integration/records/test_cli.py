# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import os

import pytest
from click.testing import CliRunner
from freezegun import freeze_time
from helpers.providers.faker import faker

from inspirehep.records.api import AuthorsRecord, JobsRecord, LiteratureRecord
from inspirehep.records.cli import importer, jobs


@pytest.mark.vcr()
def test_create_record_with_one_url(api_client, db, script_info):
    runner = CliRunner()
    control_number = 20
    result = runner.invoke(
        importer,
        [
            "records",
            "-u",
            f"https://labs.inspirehep.net/api/literature/{control_number}",
        ],
        obj=script_info,
    )
    result_record = LiteratureRecord.get_record_by_pid_value(control_number)

    assert result.exit_code == 0
    assert control_number == result_record["control_number"]


@pytest.mark.vcr()
def test_create_record_with_multiple_urls(base_app, db, script_info):
    runner = CliRunner()
    control_number_literature = 20
    control_number_author = 1_013_123
    result = runner.invoke(
        importer,
        [
            "records",
            "-u",
            f"https://labs.inspirehep.net/api/literature/{control_number_literature}",
            "-u",
            f"https://labs.inspirehep.net/api/authors/{control_number_author}",
        ],
        obj=script_info,
    )
    result_record_literature = LiteratureRecord.get_record_by_pid_value(
        control_number_literature
    )
    result_record_author = AuthorsRecord.get_record_by_pid_value(control_number_author)

    assert result.exit_code == 0
    assert control_number_literature == result_record_literature["control_number"]
    assert control_number_author == result_record_author["control_number"]


@pytest.mark.vcr()
def test_create_record_with_unreachable_url(base_app, db, script_info):
    runner = CliRunner()
    url_unreachable = "http://something"
    result = runner.invoke(
        importer, ["records", "-u", url_unreachable], obj=script_info
    )
    expected_message = (
        f"Something went wrong! Cannot reach the given url {url_unreachable}."
    )
    assert result.exit_code == 0
    assert expected_message in result.output


@pytest.mark.vcr()
def test_create_record_with_not_existing_record(base_app, db, script_info):
    runner = CliRunner()
    control_number = 999_999
    result = runner.invoke(
        importer,
        [
            "records",
            "-u",
            f"https://labs.inspirehep.net/api/literature/{control_number}",
        ],
        obj=script_info,
    )
    expected_message = (
        "Something went wrong! Status code 404, "
        f"https://labs.inspirehep.net/api/literature/{control_number} "
        "cannot be downloaded."
    )
    assert result.exit_code == 0
    assert expected_message in result.output


def test_create_record_with_one_file(base_app, db, script_info):
    runner = CliRunner()
    data = faker.record("lit", with_control_number=True)
    control_number = data["control_number"]

    with runner.isolated_filesystem():
        with open(f"{control_number}.json", "w") as f:
            f.write(json.dumps(data))

        result = runner.invoke(
            importer, ["records", "-f", f"{control_number}.json"], obj=script_info
        )
        result_record = LiteratureRecord.get_record_by_pid_value(control_number)

        assert result.exit_code == 0
        assert control_number == result_record["control_number"]


def test_create_record_with_multiple_files(base_app, db, script_info):
    runner = CliRunner()
    data_literature = faker.record("lit", with_control_number=True)
    data_author = faker.record("aut", with_control_number=True)
    control_number_literature = data_literature["control_number"]
    control_number_author = data_author["control_number"]

    with runner.isolated_filesystem():
        with open(f"{control_number_literature}.json", "w") as f:
            f.write(json.dumps(data_literature))
        with open(f"{control_number_author}.json", "w") as f:
            f.write(json.dumps(data_author))

        result = runner.invoke(
            importer,
            [
                "records",
                "-f",
                f"{control_number_literature}.json",
                "-f",
                f"{control_number_author}.json",
            ],
            obj=script_info,
        )
        result_record_literature = LiteratureRecord.get_record_by_pid_value(
            control_number_literature
        )
        result_record_author = AuthorsRecord.get_record_by_pid_value(
            control_number_author
        )

        assert result.exit_code == 0
        assert control_number_literature == result_record_literature["control_number"]
        assert control_number_author == result_record_author["control_number"]


def test_create_record_with_directory(base_app, db, script_info):
    runner = CliRunner()
    data_literature = faker.record("lit", with_control_number=True)
    data_author = faker.record("aut", with_control_number=True)
    control_number_literature = data_literature["control_number"]
    control_number_author = data_author["control_number"]

    with runner.isolated_filesystem():
        os.mkdir("test_directory/")
        with open(f"test_directory/{control_number_literature}.json", "w") as f:
            f.write(json.dumps(data_literature))
        with open(f"test_directory/{control_number_author}.json", "w") as f:
            f.write(json.dumps(data_author))

        result = runner.invoke(
            importer, ["records", "-d", "test_directory"], obj=script_info
        )
        result_record_literature = LiteratureRecord.get_record_by_pid_value(
            control_number_literature
        )
        result_record_author = AuthorsRecord.get_record_by_pid_value(
            control_number_author
        )

        assert result.exit_code == 0
        assert control_number_literature == result_record_literature["control_number"]
        assert control_number_author == result_record_author["control_number"]


def test_close_jobs_before_deadline(base_app, db, es, create_record, script_info):
    runner = CliRunner()
    expired_record = create_record(
        "job", data={"status": "open", "deadline_date": "2019-11-01"}
    )
    not_expired_record = create_record(
        "job", data={"status": "open", "deadline_date": "2020-11-01"}
    )
    result = runner.invoke(
        jobs, ["close_before", "--deadline-before-date", "2019-12-01"], obj=script_info
    )
    expired_record = JobsRecord.get_record_by_pid_value(
        expired_record["control_number"]
    )
    not_expired_record = JobsRecord.get_record_by_pid_value(
        not_expired_record["control_number"]
    )

    assert result.exit_code == 0
    assert expired_record["status"] == "closed"
    assert not_expired_record["status"] == "open"


def test_close_jobs_before_deadline_has_exclusive_deadline(
    base_app, db, es, create_record, script_info
):
    runner = CliRunner()
    job = create_record("job", data={"status": "open", "deadline_date": "2019-11-01"})
    result = runner.invoke(
        jobs, ["close_before", "--deadline-before-date", "2019-11-01"], obj=script_info
    )
    job = JobsRecord.get_record_by_pid_value(job["control_number"])

    assert result.exit_code == 0
    assert job["status"] == "open"


def test_close_jobs_before_deadline_throws_exception_for_incorrect_date(
    base_app, db, es, create_record, script_info
):
    runner = CliRunner()
    result = runner.invoke(
        jobs, ["close_before", "--deadline-before-date", "01-10-2019"], obj=script_info
    )
    assert result.exit_code == -1


@freeze_time("2019-11-01")
def test_close_jobs_before_deadline_defaults_to_current_date(
    base_app, db, es, create_record, script_info
):
    runner = CliRunner()
    expired_record = create_record(
        "job", data={"status": "open", "deadline_date": "2019-11-01"}
    )
    not_expired_record = create_record(
        "job", data={"status": "open", "deadline_date": "2020-11-01"}
    )
    result = runner.invoke(jobs, ["close_before"], obj=script_info)
    expired_record = JobsRecord.get_record_by_pid_value(
        expired_record["control_number"]
    )
    not_expired_record = JobsRecord.get_record_by_pid_value(
        not_expired_record["control_number"]
    )

    assert result.exit_code == 0
    assert expired_record["status"] == "closed"
    assert not_expired_record["status"] == "open"


def test_close_jobs_before_deadline_ignores_deleted_records(
    base_app, db, es, create_record, script_info
):
    runner = CliRunner()
    deleted_record = create_record(
        "job", data={"status": "open", "deadline_date": "2019-11-01"}
    )
    deleted_record["deleted"] = True
    deleted_record.update(dict(deleted_record))
    result = runner.invoke(
        jobs, ["close_before", "--deadline-before-date", "2019-12-01"], obj=script_info
    )
    deleted_record = JobsRecord.get_record_by_pid_value(
        deleted_record["control_number"]
    )

    assert result.exit_code == 0
    assert deleted_record["status"] == "open"
