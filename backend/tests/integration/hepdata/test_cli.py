import mock
import pytest
import requests
from freezegun import freeze_time
from helpers.utils import create_record

from inspirehep.records.api import LiteratureRecord


@pytest.mark.vcr()
@freeze_time("2021-08-12")
def test_hepdata_harvest_happy_flow(inspire_app, cli):
    record_1 = create_record("lit", data={"control_number": 1882568})
    record_2 = create_record("lit", data={"control_number": 1866118})
    record_3 = create_record("lit", data={"control_number": 1833997})
    cli.invoke(["hepdata", "harvest"])

    rec_1 = LiteratureRecord.get_record_by_pid_value(record_1["control_number"])
    rec_2 = LiteratureRecord.get_record_by_pid_value(record_2["control_number"])
    rec_3 = LiteratureRecord.get_record_by_pid_value(record_3["control_number"])
    assert rec_1["external_system_identifiers"] == [
        {"schema": "HEPDATA", "value": "ins1882568"}
    ]
    assert rec_2["external_system_identifiers"] == [
        {"schema": "HEPDATA", "value": "ins1866118"}
    ]
    assert rec_3["external_system_identifiers"] == [
        {"schema": "HEPDATA", "value": "ins1833997"}
    ]


@pytest.mark.vcr()
def test_hepdata_harvest_happy_flow_with_date_passed(inspire_app, cli):
    record_1 = create_record("lit", data={"control_number": 1882568})
    cli.invoke(["hepdata", "harvest", "--since", "2021-08-16"])

    rec_1 = LiteratureRecord.get_record_by_pid_value(record_1["control_number"])
    assert rec_1["external_system_identifiers"] == [
        {"schema": "HEPDATA", "value": "ins1882568"}
    ]


def test_hepdata_harvest_incorrect_date_passed(inspire_app, cli):
    create_record("lit", data={"control_number": 1882568})
    result = cli.invoke(["hepdata", "harvest", "--since", "2021-08"])
    assert result.exit_code == -1


def test_hepdata_harvest_request_error(inspire_app, cli):
    with mock.patch(
        "inspirehep.hepdata.cli.requests.get", side_effect=requests.ConnectionError
    ):
        result = cli.invoke(["hepdata", "harvest"])
        assert result.exit_code == -1
