import orjson
from helpers.utils import create_record_async
from inspire_utils.record import get_values_for_schema

from inspirehep.osti.tasks import _osti_sync


def test_osti_sync_new_record(inspire_app, datadir):
    data = orjson.loads((datadir / "1941988.json").read_text())
    record = create_record_async("lit", data=data)
    _osti_sync(record)
    assert get_values_for_schema(record["external_system_identifiers"])


def test_osti_sync_uodate_record(inspire_app, datadir):
    data = orjson.loads((datadir / "1941988.json").read_text())
    record = create_record_async("lit", data=data)
    external_ids = get_values_for_schema(record["external_system_identifiers"])
    _osti_sync(record)
    assert external_ids == get_values_for_schema(record["external_system_identifiers"])
