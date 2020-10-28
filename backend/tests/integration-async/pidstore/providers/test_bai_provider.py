import mock
from helpers.providers.faker import faker
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier

from inspirehep.records.api import AuthorsRecord


def test_session_still_works_after_integrity_error_on_bai_provider(
    inspire_app, override_config
):
    data = faker.record("aut")
    with override_config(FEATURE_FLAG_ENABLE_BAI_PROVIDER=True):
        AuthorsRecord.create(data=data)
        db.session.commit()
        with mock.patch(
            "inspirehep.pidstore.providers.bai.InspireBAIProvider.next_bai_number"
        ) as next_bai_mock:
            next_bai_mock.side_effect = [1, 2]
            AuthorsRecord.create(data=data)
            assert next_bai_mock.call_count == 2
        db.session.commit()

    expected_pid_count = 2

    assert (
        PersistentIdentifier.query.filter_by(pid_type="bai").count()
        == expected_pid_count
    )
