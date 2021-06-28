from helpers.providers.faker import faker
from invenio_db import db

from inspirehep.records.api import LiteratureRecord


def test_minter_saves_texkey_on_hidden_collection(inspire_app, override_config):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
        "_collections": ["HAL Hidden"],
    }
    record_data = faker.record("lit", data=data)
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=False):
        record = LiteratureRecord.create(data=record_data)
        db.session.commit()
    rec_obj = LiteratureRecord.get_record_by_pid_value(record["control_number"])
    assert "texkeys" not in rec_obj
    with override_config(FEATURE_FLAG_ENABLE_TEXKEY_MINTER=True):
        record = LiteratureRecord.get_record_by_pid_value(record["control_number"])
        data = dict(record)
        record.update(data)
        assert len(record["texkeys"]) == 1
        db.session.commit()

    rec_obj = LiteratureRecord.get_record_by_pid_value(record["control_number"])
    assert len(rec_obj["texkeys"]) == 1
