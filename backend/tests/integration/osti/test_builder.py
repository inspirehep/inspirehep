import os

import orjson
import pytest
from helpers.utils import create_record
from lxml import etree

from inspirehep.osti.builder import OstiBuilder


@pytest.fixture(scope="function")
def insert_conferences_in_db(datadir):
    conferences_dir = datadir / "conferences"
    for conference_dir in os.scandir(conferences_dir):
        create_record(
            "con",
            data=orjson.loads((conferences_dir / conference_dir.name).read_text()),
        )


@pytest.mark.parametrize(
    "record_filename, expected_filename",
    [
        ("1941996.json", "1941996_expected.xml"),
        ("1941988.json", "1941988_expected.xml"),
        ("1944632.json", "1944632_expected.xml"),
        ("1944634.json", "1944634_expected.xml"),
    ],
)
def test_builder(
    inspire_app, datadir, insert_conferences_in_db, record_filename, expected_filename
):
    data = orjson.loads((datadir / record_filename).read_text())
    expected = etree.parse(str(datadir / expected_filename))

    record = create_record("lit", data=data)
    builder = OstiBuilder(record)
    builder.build_osti_xml()
    result = etree.ElementTree(builder.get_xml())

    for parent in result.xpath("//*[./*]"):
        parent[:] = sorted(parent, key=lambda x: x.tag)

    for parent in expected.xpath("//*[./*]"):
        parent[:] = sorted(parent, key=lambda x: x.tag)

    for child_resul, child_expected in zip(result.getroot(), expected.getroot()):
        assert etree.dump(child_resul) == etree.dump(child_expected)
