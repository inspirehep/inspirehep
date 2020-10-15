import json

from helpers.providers.faker import faker

from inspirehep.records.marshmallow.conferences.ui import ConferencesListSchema


def test_api_schema_doesnt_include_email_in_contact_details():
    data = [{"email": "test.test.test@cern.ch", "name": "Test, Contact",}]

    job = faker.record("con", data={"contact_details": data})
    result = ConferencesListSchema().dumps(job).data
    result_data = json.loads(result)

    assert "emails" not in result_data["contact_details"]
