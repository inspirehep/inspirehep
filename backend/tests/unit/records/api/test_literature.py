from datetime import datetime

import mock
from helpers.providers.faker import faker

from inspirehep.records.api import LiteratureRecord


def test_earliest_date_fallback_to_created_property_when_created_missing_returns_none():
    rec_data = faker.record("lit")
    rec = LiteratureRecord(data=rec_data)
    assert rec.created is None
    assert rec.earliest_date is None


def test_earliest_date_fallback_to_created_property():
    rec_data = faker.record("lit")
    rec = LiteratureRecord(data=rec_data)
    with mock.patch(
        "invenio_records.api.Record.created", new_callable=mock.PropertyMock
    ) as created_mock:
        created_mock.return_value = datetime(2020, 9, 15)
        assert rec.earliest_date == "2020-09-15"


def test_earliest_date_do_not_use_created_property_when_get_literature_earliest_date_returns_data():
    rec_data = faker.record("lit")
    rec = LiteratureRecord(data=rec_data)
    with mock.patch(
        "inspirehep.records.api.literature.get_literature_earliest_date",
        return_value="2020-09-16",
    ):
        assert rec.earliest_date == "2020-09-16"
