import orjson
from helpers.providers.faker import faker
from helpers.utils import create_user
from invenio_accounts.testutils import login_user_via_session
from invenio_db import db
from invenio_search import current_search
from tenacity import retry, stop_after_delay, wait_fixed

from inspirehep.accounts.roles import Roles
from inspirehep.records.api import AuthorsRecord, LiteratureRecord
from inspirehep.records.utils import get_author_by_recid
from inspirehep.search.api import LiteratureSearch


def test_assign_regression(inspire_app, datadir, override_config, clean_celery_session):
    aut_data = faker.record("aut", data={"control_number": 1486131})

    AuthorsRecord(aut_data).create(aut_data)
    lit_data = orjson.loads((datadir / "2171912.json").read_text())
    literature = LiteratureRecord(data=lit_data).create(lit_data)
    literature_control_number = literature["control_number"]
    db.session.commit()

    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True, FEATURE_FLAG_ENABLE_BAI_CREATION=True
    ):
        cataloger = create_user(role=Roles.cataloger.value)

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=cataloger.email)
            response = client.post(
                "/api/assign/literature/unassign",
                data=orjson.dumps(
                    {
                        "literature_ids": [str(2171912)],
                        "from_author_recid": 1486131,
                    }
                ),
                content_type="application/json",
            )
        response_status_code = response.status_code

    assert response_status_code == 200
    assert "stub_author_id" in response.json
    stub_author_id = response.json["stub_author_id"]
    stub_author_record = AuthorsRecord.get_record_by_pid_value(stub_author_id)
    assert stub_author_record

    @retry(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_get_author_by_recid():
        current_search.flush_and_refresh("*")
        lit_record = LiteratureSearch().get_records_by_pids(
            [("lit", literature_control_number)]
        )[0]
        assert get_author_by_recid(lit_record.to_dict(), stub_author_id)

    assert_get_author_by_recid()
