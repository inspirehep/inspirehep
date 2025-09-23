#
# This file is part of INSPIRE.
# Copyright (C) 2014-2017 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundationeither version 3 of the Licenseor
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If notsee <http://www.gnu.org/licenses/>.
#
# In applying this licenseCERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.
import os

import mock
import orjson
import pkg_resources
from helpers.utils import create_record, create_record_factory, xml_compare
from inspirehep.orcid.cache import _OrcidHasher
from inspirehep.orcid.converter import ExternalIdentifier, OrcidConverter
from lxml import etree


def valid_against_schema(xml):
    """Validate xml schema."""
    schema_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "record_2.0", "work-2.0.xsd")
    )
    schema = etree.XMLSchema(file=schema_path)
    schema.assertValid(xml)
    return True


def xml_parse(xml_string):
    """Parse an ``xml_string`` into XML."""
    parser = etree.XMLParser(remove_blank_text=True)
    return etree.fromstring(xml_string, parser)


def test_format_article(inspire_app, datadir):
    data = orjson.loads((datadir / "4328.json").read_text())
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}")
    assert response.status_code == 200
    article = orjson.loads(response.data)

    expected = xml_parse(
        f"""
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>Partial Symmetries of Weak Interactions</common:title>
        </work:title>
        <work:journal-title>Nucl.Phys.</work:journal-title>
        <work:type>journal-article</work:type>
        <common:publication-date>
            <common:year>1961</common:year>
        </common:publication-date>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>{record_control_number}</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/{record_control_number}</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>doi</common:external-id-type>
                <common:external-id-value>10.1016/0029-5582(61)90469-2</common:external-id-value>
                <common:external-id-url>http://dx.doi.org/10.1016/0029-5582(61)90469-2</common:external-id-url>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/{record_control_number}</work:url>
        <work:contributors>
            <work:contributor>
                <work:credit-name>Glashow, S.L.</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>first</work:contributor-sequence>
                    <work:contributor-role>author</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
        </work:contributors>
    </work:work>
    """
    )

    result = OrcidConverter(
        article["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    ).get_xml()
    assert valid_against_schema(result)
    assert xml_compare(expected, result)
    assert _OrcidHasher(mock.Mock())._hash_xml_element(expected) == _OrcidHasher(
        mock.Mock()
    )._hash_xml_element(result)


def test_format_conference_paper(inspire_app, datadir):
    data = orjson.loads((datadir / "524480.json").read_text())
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]
    data_conference = orjson.loads((datadir / "972464.json").read_text())
    create_record_factory("con", data=data_conference, with_indexing=True)
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}")
    assert response.status_code == 200
    inproceedings = orjson.loads(response.data)

    expected = xml_parse(
        f"""
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>CMB anisotropies: A Decadal survey</common:title>
        </work:title>
        <work:journal-title>4th RESCEU International Symposium on Birth and Evolution of the Universe</work:journal-title>
        <work:type>conference-paper</work:type>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>{record_control_number}</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/{record_control_number}</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>arxiv</common:external-id-type>
                <common:external-id-value>astro-ph/0002520</common:external-id-value>
                <common:external-id-url>http://arxiv.org/abs/astro-ph/0002520</common:external-id-url>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/{record_control_number}</work:url>
        <work:contributors>
            <work:contributor>
                <work:credit-name>Hu, Wayne</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>first</work:contributor-sequence>
                    <work:contributor-role>author</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
        </work:contributors>
    </work:work>
    """
    )
    result = OrcidConverter(
        inproceedings["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    ).get_xml()
    assert valid_against_schema(result)
    assert xml_compare(expected, result)
    assert _OrcidHasher(mock.Mock())._hash_xml_element(expected) == _OrcidHasher(
        mock.Mock()
    )._hash_xml_element(result)


def test_format_proceedings(inspire_app, datadir):
    data = orjson.loads((datadir / "701585.json").read_text())
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}")
    assert response.status_code == 200
    proceedings = orjson.loads(response.data)

    expected = xml_parse(
        f"""
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>HERA and the LHC: A Workshop on the implications of HERA for LHC physics: Proceedings Part A</common:title>
        </work:title>
        <work:type>edited-book</work:type>
        <common:publication-date>
            <common:year>2005</common:year>
        </common:publication-date>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>{record_control_number}</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/{record_control_number}</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>arxiv</common:external-id-type>
                <common:external-id-value>hep-ph/0601012</common:external-id-value>
                <common:external-id-url>http://arxiv.org/abs/hep-ph/0601012</common:external-id-url>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/{record_control_number}</work:url>
        <work:contributors>
            <work:contributor>
                <work:credit-name>De Roeck, A.</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>first</work:contributor-sequence>
                    <work:contributor-role>editor</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
            <work:contributor>
                <work:credit-name>Jung, H.</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>additional</work:contributor-sequence>
                    <work:contributor-role>editor</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
        </work:contributors>
    </work:work>
    """
    )

    result = OrcidConverter(
        proceedings["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    ).get_xml()
    assert valid_against_schema(result)
    assert xml_compare(expected, result)
    assert _OrcidHasher(mock.Mock())._hash_xml_element(expected) == _OrcidHasher(
        mock.Mock()
    )._hash_xml_element(result)


def test_format_thesis(inspire_app, datadir):
    data = orjson.loads((datadir / "1395663.json").read_text())
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}")
    assert response.status_code == 200
    phdthesis = orjson.loads(response.data)

    expected = xml_parse(
        f"""
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>MAGIC $\\gamma$-ray observations of distant AGN and a study of source variability and the extragalactic background light using FERMI and air Cherenkov telescopes</common:title>
        </work:title>
        <work:type>dissertation</work:type>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>{record_control_number}</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/{record_control_number}</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/{record_control_number}</work:url>
        <work:contributors>
            <work:contributor>
                <work:credit-name>Mankuzhiyil, Nijil</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>first</work:contributor-sequence>
                    <work:contributor-role>author</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
        </work:contributors>
    </work:work>
    """
    )

    result = OrcidConverter(
        phdthesis["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    ).get_xml()
    assert valid_against_schema(result)
    assert xml_compare(expected, result)
    assert _OrcidHasher(mock.Mock())._hash_xml_element(expected) == _OrcidHasher(
        mock.Mock()
    )._hash_xml_element(result)


def test_format_book(inspire_app, datadir):
    data = orjson.loads((datadir / "736770.json").read_text())
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}")
    assert response.status_code == 200
    book = orjson.loads(response.data)

    expected = xml_parse(
        f"""
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>Differential geometry and Lie groups for physicists</common:title>
        </work:title>
        <work:type>book</work:type>
        <common:publication-date>
            <common:year>2011</common:year>
            <common:month>03</common:month>
            <common:day>03</common:day>
        </common:publication-date>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>{record_control_number}</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/{record_control_number}</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>isbn</common:external-id-type>
                <common:external-id-value>9780521187961</common:external-id-value>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>isbn</common:external-id-type>
                <common:external-id-value>9780521845076</common:external-id-value>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>isbn</common:external-id-type>
                <common:external-id-value>9780511242960</common:external-id-value>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/{record_control_number}</work:url>
        <work:contributors>
            <work:contributor>
                <work:credit-name>Fecko, M.</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>first</work:contributor-sequence>
                    <work:contributor-role>author</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
        </work:contributors>
    </work:work>
    """
    )

    result = OrcidConverter(
        book["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    ).get_xml()
    assert valid_against_schema(result)
    assert xml_compare(expected, result)
    assert _OrcidHasher(mock.Mock())._hash_xml_element(expected) == _OrcidHasher(
        mock.Mock()
    )._hash_xml_element(result)


def test_format_book_chapter(inspire_app, datadir):
    data = orjson.loads((datadir / "1375491.json").read_text())
    del data["deleted_records"]
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}")
    assert response.status_code == 200
    inbook = orjson.loads(response.data)

    expected = xml_parse(
        f"""
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>Supersymmetry</common:title>
        </work:title>
        <work:type>book-chapter</work:type>
        <common:publication-date>
            <common:year>2015</common:year>
        </common:publication-date>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>{record_control_number}</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/{record_control_number}</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>doi</common:external-id-type>
                <common:external-id-value>10.1007/978-3-319-15001-7_10</common:external-id-value>
                <common:external-id-url>http://dx.doi.org/10.1007/978-3-319-15001-7_10</common:external-id-url>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>arxiv</common:external-id-type>
                <common:external-id-value>1506.03091</common:external-id-value>
                <common:external-id-url>http://arxiv.org/abs/1506.03091</common:external-id-url>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/{record_control_number}</work:url>
        <work:contributors>
            <work:contributor>
                <work:credit-name>Bechtle, Philip</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>first</work:contributor-sequence>
                    <work:contributor-role>author</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
            <work:contributor>
                <work:credit-name>Plehn, Tilman</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>additional</work:contributor-sequence>
                    <work:contributor-role>author</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
                <work:contributor>
                <work:credit-name>Sander, Christian</work:credit-name>
                <work:contributor-attributes>
                    <work:contributor-sequence>additional</work:contributor-sequence>
                    <work:contributor-role>author</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
        </work:contributors>
    </work:work>
    """
    )

    result = OrcidConverter(
        inbook["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    ).get_xml()
    assert valid_against_schema(result)
    assert xml_compare(expected, result)
    assert _OrcidHasher(mock.Mock())._hash_xml_element(expected) == _OrcidHasher(
        mock.Mock()
    )._hash_xml_element(result)


def test_format_thesis_with_author_orcid(inspire_app, datadir):
    data = orjson.loads((datadir / "1395663.json").read_text())
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}")
    assert response.status_code == 200
    phdthesis = orjson.loads(response.data)

    phdthesis["metadata"]["authors"][0]["ids"] = [
        {"schema": "ORCID", "value": "0000-0002-1825-0097"}
    ]
    phdthesis["metadata"]["authors"][0]["emails"] = ["email@fake-domain.local"]

    expected = xml_parse(
        f"""
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>MAGIC $\\gamma$-ray observations of distant AGN and a study of source variability and the extragalactic background light using FERMI and air Cherenkov telescopes</common:title>
        </work:title>
        <work:type>dissertation</work:type>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>{record_control_number}</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/{record_control_number}</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/{record_control_number}</work:url>
        <work:contributors>
            <work:contributor>
                <common:contributor-orcid>
                    <common:uri>http://orcid.org/0000-0002-1825-0097</common:uri>
                    <common:path>0000-0002-1825-0097</common:path>
                    <common:host>orcid.org</common:host>
                </common:contributor-orcid>
                <work:credit-name>Mankuzhiyil, Nijil</work:credit-name>
                <work:contributor-email>email@fake-domain.local</work:contributor-email>
                <work:contributor-attributes>
                    <work:contributor-sequence>first</work:contributor-sequence>
                    <work:contributor-role>author</work:contributor-role>
                </work:contributor-attributes>
            </work:contributor>
        </work:contributors>
    </work:work>
    """
    )

    result = OrcidConverter(
        phdthesis["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    ).get_xml()
    assert valid_against_schema(result)
    assert xml_compare(expected, result)
    assert _OrcidHasher(mock.Mock())._hash_xml_element(expected) == _OrcidHasher(
        mock.Mock()
    )._hash_xml_element(result)


def test_external_identifiers(inspire_app, datadir):
    data = orjson.loads((datadir / "1375491.json").read_text())
    del data["deleted_records"]
    create_record("lit", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/literature/1375491")
    assert response.status_code == 200
    inbook = orjson.loads(response.data)

    converter = OrcidConverter(
        inbook["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    )
    converter.get_xml()
    expected = [
        ExternalIdentifier(type="other-id", value="1375491"),
        ExternalIdentifier(type="doi", value="10.1007/978-3-319-15001-7_10"),
        ExternalIdentifier(type="arxiv", value="1506.03091"),
    ]
    assert converter.added_external_identifiers == expected


def test_bibtex_do_add_bibtex_citation(inspire_app, datadir):
    data = orjson.loads(
        (datadir / "test_orcid_converter_TestBibtexCitation.json").read_text()
    )
    record = create_record("lit", data=data)
    converter = OrcidConverter(
        record=record, url_pattern="http://inspirehep.net/record/{recid}"
    )
    xml_root = converter.get_xml(do_add_bibtex_citation=True)
    top_level_tags = [etree.QName(node).localname for node in xml_root.getchildren()]
    assert "citation" in top_level_tags


def test_bibtext_do_not_add_bibtex_citation(inspire_app, datadir):
    data = orjson.loads(
        (datadir / "test_orcid_converter_TestBibtexCitation.json").read_text()
    )
    record = create_record("lit", data=data)
    converter = OrcidConverter(
        record=record, url_pattern="http://inspirehep.net/record/{recid}"
    )
    xml_root = converter.get_xml()
    top_level_tags = [etree.QName(node).localname for node in xml_root.getchildren()]
    assert "citation" not in top_level_tags


def test_strip_xml_from_title(inspire_app, datadir):
    data = orjson.loads(
        (datadir / "test_orcid_converter_TestBibtexCitation.json").read_text()
    )
    data["titles"] = [
        {
            "title": 'Measurement of <math display="inline"><msubsup><mi mathvariant="normal">Ω</mi><mi mathvariant="normal">c</mi><mn>0</mn></msubsup></math> baryon production and branching-fraction ratio <math display="inline"><mi>BR</mi><mo stretchy="false">(</mo><msubsup><mi mathvariant="normal">Ω</mi><mi mathvariant="normal">c</mi><mn>0</mn></msubsup><mo stretchy="false">→</mo><msup><mi mathvariant="normal">Ω</mi><mo>-</mo></msup><msup><mi mathvariant="normal">e</mi><mo>+</mo></msup><msub><mi>ν</mi><mi mathvariant="normal">e</mi></msub><mo stretchy="false">)</mo><mo>/</mo><mi>BR</mi><mo stretchy="false">(</mo><msubsup><mi mathvariant="normal">Ω</mi><mi mathvariant="normal">c</mi><mn>0</mn></msubsup><mo stretchy="false">→</mo><msup><mi mathvariant="normal">Ω</mi><mo>-</mo></msup><msup><mi>π</mi><mo>+</mo></msup><mo stretchy="false">)</mo></math> in <math display="inline"><mi>p</mi><mi>p</mi></math> collisions at <math display="inline"><msqrt><mi>s</mi></msqrt><mo>=</mo><mn>13</mn><mtext>\u2009</mtext><mtext>\u2009</mtext><mi>TeV</mi></math>',
            "source": "arXiv",
        }
    ]
    record = create_record("lit", data=data)
    converter = OrcidConverter(
        record=record, url_pattern="http://inspirehep.net/record/{recid}"
    )
    xml_root = converter.get_xml()

    result_title = xml_root.find(
        "work:title", {"work": "http://www.orcid.org/ns/work"}
    )[0].text

    expected_title = "Measurement of Ωc0 baryon production and branching-fraction ratio BR(Ωc0→Ω-e+νe)/BR(Ωc0→Ω-π+) in pp collisions at s=13\u2009\u2009TeV"
    assert expected_title == result_title


def test_strip_xml_from_title_with_special_characters(inspire_app, datadir):
    data = orjson.loads(
        (datadir / "test_orcid_converter_TestBibtexCitation.json").read_text()
    )
    data["titles"] = [
        {
            "title": "Hubble tension between z < 5 and z > 9",
            "source": "arXiv",
        }
    ]
    record = create_record("lit", data=data)
    converter = OrcidConverter(
        record=record, url_pattern="http://inspirehep.net/record/{recid}"
    )
    xml_root = converter.get_xml()

    result_title = xml_root.find(
        "work:title", {"work": "http://www.orcid.org/ns/work"}
    )[0].text

    expected_title = "Hubble tension between z < 5 and z > 9"
    assert expected_title == result_title


def test_isbn_with_relationship(inspire_app, datadir):
    data = orjson.loads(
        (datadir / "test_orcid_converter_TestBibtexCitation.json").read_text()
    )
    data["isbns"] = [{"value": "9789151311128"}]
    record = create_record("lit", data=data)
    converter = OrcidConverter(
        record=record, url_pattern="http://inspirehep.net/record/{recid}"
    )
    xml_root = converter.get_xml()

    relationship = xml_root.find(
        ".//common:external-id[common:external-id-type='isbn']/common:external-id-relationship",
        {
            "work": "http://www.orcid.org/ns/work",
            "common": "http://www.orcid.org/ns/common",
        },
    )
    assert relationship is not None
