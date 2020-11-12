# -*- coding: utf-8 -*-
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
import io
import json
import os

import mock
import pkg_resources
from helpers.utils import create_record, create_record_factory
from lxml import etree

from inspirehep.orcid.cache import _OrcidHasher
from inspirehep.orcid.converter import ExternalIdentifier, OrcidConverter
from inspirehep.pidstore.api import PidStoreBase


def canonicalize_xml_element(element):
    """Return a string with a canonical representation of the element.
    """
    element_tree = element.getroottree()
    output_stream = io.BytesIO()
    element_tree.write_c14n(output_stream, with_comments=False, exclusive=True)
    return output_stream.getvalue()


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


def xml_compare(expected, result):
    """Assert two XML nodes equal."""
    result_xml_canonicalized = canonicalize_xml_element(result)
    expected_xml_canonicalized = canonicalize_xml_element(expected)
    assert result_xml_canonicalized == expected_xml_canonicalized
    return True


def test_format_article(inspire_app, datadir):
    data = json.loads((datadir / "4328.json").read_text())
    create_record("lit", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/literature/4328")
    assert response.status_code == 200
    article = json.loads(response.data)

    expected = xml_parse(
        """
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
              <common:external-id-value>4328</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/4328</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>doi</common:external-id-type>
                <common:external-id-value>10.1016/0029-5582(61)90469-2</common:external-id-value>
                <common:external-id-url>http://dx.doi.org/10.1016/0029-5582(61)90469-2</common:external-id-url>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/4328</work:url>
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
    data = json.loads((datadir / "524480.json").read_text())
    record = create_record("lit", data=data)
    data_conference = json.loads((datadir / "972464.json").read_text())
    record_conference = create_record_factory(
        "con", data=data_conference, with_indexing=True
    )
    with inspire_app.test_client() as client:
        response = client.get("/literature/524480")
    assert response.status_code == 200
    inproceedings = json.loads(response.data)

    expected = xml_parse(
        """
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>CMB anisotropies: A Decadal survey</common:title>
        </work:title>
        <work:journal-title>4th RESCEU International Symposium on Birth and Evolution of the Universe</work:journal-title>
        <work:type>conference-paper</work:type>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>524480</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/524480</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>arxiv</common:external-id-type>
                <common:external-id-value>astro-ph/0002520</common:external-id-value>
                <common:external-id-url>http://arxiv.org/abs/astro-ph/0002520</common:external-id-url>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/524480</work:url>
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
    data = json.loads((datadir / "701585.json").read_text())
    record = create_record("lit", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/literature/701585")
    assert response.status_code == 200
    proceedings = json.loads(response.data)

    expected = xml_parse(
        """
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
              <common:external-id-value>701585</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/701585</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>arxiv</common:external-id-type>
                <common:external-id-value>hep-ph/0601012</common:external-id-value>
                <common:external-id-url>http://arxiv.org/abs/hep-ph/0601012</common:external-id-url>
                <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/701585</work:url>
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
    data = json.loads((datadir / "1395663.json").read_text())
    record = create_record("lit", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/literature/1395663")
    assert response.status_code == 200
    phdthesis = json.loads(response.data)

    expected = xml_parse(
        """
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>MAGIC $\\gamma$-ray observations of distant AGN and a study of source variability and the extragalactic background light using FERMI and air Cherenkov telescopes</common:title>
        </work:title>
        <work:type>dissertation</work:type>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>1395663</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/1395663</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/1395663</work:url>
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
    data = json.loads((datadir / "736770.json").read_text())
    record = create_record("lit", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/literature/736770")
    assert response.status_code == 200
    book = json.loads(response.data)

    expected = xml_parse(
        """
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
              <common:external-id-value>736770</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/736770</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>isbn</common:external-id-type>
                <common:external-id-value>9780521187961</common:external-id-value>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>isbn</common:external-id-type>
                <common:external-id-value>9780521845076</common:external-id-value>
            </common:external-id>
            <common:external-id>
                <common:external-id-type>isbn</common:external-id-type>
                <common:external-id-value>9780511242960</common:external-id-value>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/736770</work:url>
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
    data = json.loads((datadir / "1375491.json").read_text())
    del data["deleted_records"]
    record = create_record("lit", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/literature/1375491")
    assert response.status_code == 200
    inbook = json.loads(response.data)

    expected = xml_parse(
        """
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
              <common:external-id-value>1375491</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/1375491</common:external-id-url>
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
        <work:url>http://inspirehep.net/record/1375491</work:url>
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
    data = json.loads((datadir / "1395663.json").read_text())
    record = create_record("lit", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/literature/1395663")
    assert response.status_code == 200
    phdthesis = json.loads(response.data)

    phdthesis["metadata"]["authors"][0]["ids"] = [
        {"schema": "ORCID", "value": "0000-0002-1825-0097"}
    ]
    phdthesis["metadata"]["authors"][0]["emails"] = ["email@fake-domain.local"]

    expected = xml_parse(
        """
    <work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work">
        <work:title>
            <common:title>MAGIC $\\gamma$-ray observations of distant AGN and a study of source variability and the extragalactic background light using FERMI and air Cherenkov telescopes</common:title>
        </work:title>
        <work:type>dissertation</work:type>
        <common:external-ids>
            <common:external-id>
              <common:external-id-type>other-id</common:external-id-type>
              <common:external-id-value>1395663</common:external-id-value>
              <common:external-id-url>http://inspirehep.net/record/1395663</common:external-id-url>
              <common:external-id-relationship>self</common:external-id-relationship>
            </common:external-id>
        </common:external-ids>
        <work:url>http://inspirehep.net/record/1395663</work:url>
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
    data = json.loads((datadir / "1375491.json").read_text())
    del data["deleted_records"]
    record = create_record("lit", data=data)
    with inspire_app.test_client() as client:
        response = client.get("/literature/1375491")
    assert response.status_code == 200
    inbook = json.loads(response.data)

    converter = OrcidConverter(
        inbook["metadata"], url_pattern="http://inspirehep.net/record/{recid}"
    )
    converter.get_xml()
    expected = [
        ExternalIdentifier(type="other-id", value="1375491"),
        ExternalIdentifier(type="doi", value=u"10.1007/978-3-319-15001-7_10"),
        ExternalIdentifier(type="arxiv", value=u"1506.03091"),
    ]
    assert converter.added_external_identifiers == expected


def test_bibtex_do_add_bibtex_citation(inspire_app, datadir):
    data = json.loads(
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
    data = json.loads(
        (datadir / "test_orcid_converter_TestBibtexCitation.json").read_text()
    )
    record = create_record("lit", data=data)
    converter = OrcidConverter(
        record=record, url_pattern="http://inspirehep.net/record/{recid}"
    )
    xml_root = converter.get_xml()
    top_level_tags = [etree.QName(node).localname for node in xml_root.getchildren()]
    assert "citation" not in top_level_tags
