from helpers.providers.faker import faker
from inspirehep.records.api.literature import LiteratureRecord
from invenio_db import db


def test_minter_saves_texkey_on_hidden_collection(inspire_app, override_config):
    data = {
        "authors": [{"full_name": "Janeway, K."}],
        "publication_info": [{"year": 2000}],
        "_collections": ["HAL Hidden"],
    }
    record_data = faker.record("lit", data=data)
    record = LiteratureRecord.create(data=record_data)
    db.session.commit()
    record = LiteratureRecord.get_record_by_pid_value(record["control_number"])
    data = dict(record)
    record.update(data)
    assert len(record["texkeys"]) == 1
    db.session.commit()

    rec_obj = LiteratureRecord.get_record_by_pid_value(record["control_number"])
    assert len(rec_obj["texkeys"]) == 1
