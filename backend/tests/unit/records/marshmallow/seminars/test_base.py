from helpers.providers.faker import faker

from inspirehep.records.marshmallow.seminars.base import SeminarsPublicListSchema


def test_api_seminars_schema_doesnt_return_acquisition_source_email():
    acquisition_source = {
        "email": "test@me.ch",
        "orcid": "0000-0000-0000-0000",
        "method": "oai",
        "source": "submitter",
        "internal_uid": 00000,
    }

    expected = {
        "orcid": "0000-0000-0000-0000",
        "method": "oai",
        "source": "submitter",
        "internal_uid": 00000,
    }

    data = {"acquisition_source": acquisition_source}
    data_record = faker.record("sem", data=data)
    result = SeminarsPublicListSchema().dump(data_record).data

    assert expected == result["acquisition_source"]


def test_api_seminars_schema_doesnt_return_contact_details_with_email():
    contact_details = [{"name": "Test, Contact", "email": "test.test@test.de"}]
    expected = [{"name": "Test, Contact"}]

    data = {"contact_details": contact_details}
    data_record = faker.record("sem", data=data)
    result = SeminarsPublicListSchema().dump(data_record).data

    assert expected == result["contact_details"]
