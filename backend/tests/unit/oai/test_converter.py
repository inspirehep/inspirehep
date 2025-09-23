import pytest
from helpers.utils import xml_compare
from inspirehep.oai.converter import OpenAIREXMLConverter
from lxml import etree
from mock import patch


def collect_creators(record):
    return list(OpenAIREXMLConverter()._iter_creators(record))


def collect_alts(record):
    return list(OpenAIREXMLConverter()._iter_alternate_identifiers(record))


@pytest.mark.parametrize(
    ("record", "expected"),
    [
        (
            {"document_type": ["thesis"], "thesis_info": {"degree_type": "bachelor"}},
            "bachelor thesis",
        ),
        (
            {"document_type": ["thesis"], "thesis_info": {"degree_type": "master"}},
            "master thesis",
        ),
        (
            {"document_type": ["thesis"], "thesis_info": {"degree_type": "phd"}},
            "doctoral thesis",
        ),
        ({"document_type": ["thesis"], "thesis_info": {}}, "thesis"),
        ({"document_type": ["book"]}, "book"),
        ({"document_type": ["book chapter"]}, "book part"),
        ({"document_type": ["conference paper"]}, "conference paper"),
        ({"document_type": ["proceedings"]}, "conference proceedings"),
        (
            {
                "document_type": ["article"],
                "publication_info": [{"journal_title": "JHEP"}],
            },
            "journal article",
        ),
        ({"document_type": ["report"]}, "report"),
        ({"document_type": ["activity_report"]}, "report"),
        ({"document_type": ["note"]}, "research report"),
        (
            {
                "document_type": ["article"],
                "publication_info": [],
                "arxiv_eprints": [{"value": "2509.17779"}],
            },
            "preprint",
        ),
        (
            {"document_type": ["article"], "publication_info": [], "arxiv_eprints": []},
            "research article",
        ),
        ({}, None),
    ],
)
def test_compute_resource_type_text(record, expected):
    builder = OpenAIREXMLConverter()
    assert builder._compute_resource_type_text(record) == expected


def test_iter_creators_collabs_and_authors_order_and_filtering():
    record = {
        "collaborations": [
            "ATLAS Collaboration",
            "CMS Team",  # filtered (ends with 'team')
            {"value": "IceCube Consortium"},  # filtered (ends with 'consortium')
            {"value": "LIGO Scientific Collaboration"},
        ],
        "authors": [
            {"full_name": "Alice A."},
            {"full_name": "Bob B."},
        ],
    }

    result = collect_creators(record)
    assert result == [
        "ATLAS Collaboration",
        "LIGO Scientific Collaboration",
        "Alice A.",
        "Bob B.",
    ]


def test_iter_creators_ignores_empty_values():
    record = {
        "collaborations": [
            "",
            {"value": ""},
            {"value": None},
            "Some Group",  # filtered (ends with 'group')
            "Nice Collab",  # keep
        ],
        "authors": [
            {"full_name": "Jane Smith"},
        ],
    }

    result = collect_creators(record)
    assert result == ["Nice Collab", "Jane Smith"]


def test_iter_creators_only_authors():
    record = {
        "authors": [
            {"full_name": "John Doe"},
            {"full_name": "Jane Roe"},
        ]
    }
    result = collect_creators(record)
    assert result == ["John Doe", "Jane Roe"]


def test_iter_creators_only_collaborations_various_cases():
    record = {
        "collaborations": [
            "Super Detector Group",
            "Data Forces",
            "Analysis Force",
            "MiniCollab",
            "Neutrino Groups",
            "TEAM",
            "Alpha-Beta",
        ]
    }
    result = collect_creators(record)
    assert result == ["Data Forces", "MiniCollab", "Alpha-Beta"]


def test_iter_alternate_identifiers_all_types():
    record = {
        "dois": [{"value": "10.1234/example"}],
        "isbns": [{"value": "978-3-16-148410-0"}],
        "persistent_identifiers": [
            {"schema": "HDL", "value": "12345/6789"},
            {"schema": "URN", "value": "urn:nbn:de:1234-5678"},
        ],
        "arxiv_eprints": [{"value": "2509.17779"}],
    }
    result = collect_alts(record)
    assert result == [
        ("10.1234/example", "DOI"),
        ("978-3-16-148410-0", "ISBN"),
        ("12345/6789", "Handle"),
        ("urn:nbn:de:1234-5678", "URN"),
        ("2509.17779", "arXiv"),
    ]


@pytest.mark.parametrize(
    ("licenses", "expected"),
    [
        ([], "metadata only access"),
        ([{"license": "MIT"}], "metadata only access"),
        ([{"license": "cc by 4.0"}], "open access"),
        ([{"license": "CC BY 4.0"}], "open access"),
        ([{"license": "GPL"}, {"license": "CC0"}], "open access"),
        ([{}], "metadata only access"),
    ],
)
def test_rights_from_license(licenses, expected):
    builder = OpenAIREXMLConverter()
    record = {"license": licenses}
    assert builder._rights_from_license(record) == expected


@pytest.mark.parametrize(
    ("titles", "expected"),
    [
        ([{"title": "Main Title"}], ("Main Title", None)),
        ([{"subtitle": "Just a Subtitle"}], (None, "Just a Subtitle")),
        ([{"title": "Main Title", "subtitle": "Sub"}], ("Main Title", "Sub")),
        ([{"title": "", "subtitle": "Sub"}], ("", "Sub")),
        ([{"title": "Title", "subtitle": ""}], ("Title", None)),
    ],
)
def test_compose_title(titles, expected):
    builder = OpenAIREXMLConverter()
    record = {"titles": titles}
    assert builder._compose_title(record) == expected


def test_full_record_generates_expected_xml():
    record = {
        "control_number": 123456,
        "titles": [{"title": "Sample Title", "subtitle": "An Example"}],
        "earliest_date": "2020-01-01",
        "languages": ["en"],
        "abstracts": [{"value": "This is a sample abstract."}],
        "license": [{"license": "CC BY 4.0"}],
        "inspire_categories": [{"term": "Physics"}],
        "collaborations": ["Sample Collaboration"],
        "authors": [{"full_name": "John Doe"}, {"full_name": "Jane Smith"}],
        "dois": [{"value": "10.1234/example.doi"}],
        "isbns": [{"value": "978-3-16-148410-0"}],
        "persistent_identifiers": [
            {"schema": "HDL", "value": "12345/6789"},
            {"schema": "URN", "value": "urn:nbn:de:1234-5678"},
        ],
        "arxiv_eprints": [{"value": "2509.17779"}],
        "documents": [
            {
                "filename": "file1.pdf",
                "url": "https://inspirehep.net/files/file1.pdf",
                "fulltext": True,
                "hidden": False,
            },
            {
                "filename": "file2.pdf",
                "url": "https://inspirehep.net/files/file2.pdf",
                "fulltext": True,
                "hidden": False,
            },
            {
                "filename": "supplement.xml",
                "url": "https://inspirehep.net/files/supplement.xml",
                "fulltext": False,
                "hidden": False,
            },
        ],
        "publication_info": [
            {
                "journal_title": "Phys.Rev.D",
                "journal_volume": "95",
                "journal_issue": "2",
                "page_start": "025013",
                "page_end": "025020",
                "year": 2017,
                "material": "publication",
            },
            {
                "journal_title": "JHEP",
                "journal_volume": "06",
                "page_start": "060",
                "journal_issue": "2",
                "page_end": "080",
                "year": 2007,
                "material": "publication",
            },
        ],
        "document_type": ["thesis"],
        "thesis_info": {
            "degree_type": "bachelor",
            "university": "MIT",
            "defense_date": "2020-06-15",
        },
        "editions": ["First Edition"],
    }

    expected_xml = """<?xml version='1.0' encoding='UTF-8'?>
<oaire:resource xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:datacite="http://datacite.org/schema/kernel-4" xmlns:oaire="http://namespace.openaire.eu/schema/oaire/" xsi:schemaLocation="http://namespace.openaire.eu/schema/oaire/ https://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd">
  <datacite:titles>
    <datacite:title>Sample Title</datacite:title>
    <datacite:title titleType="Subtitle">An Example</datacite:title>
  </datacite:titles>
  <datacite:creators>
    <datacite:creator>
      <datacite:creatorName>Sample Collaboration</datacite:creatorName>
    </datacite:creator>
    <datacite:creator>
      <datacite:creatorName>John Doe</datacite:creatorName>
    </datacite:creator>
    <datacite:creator>
      <datacite:creatorName>Jane Smith</datacite:creatorName>
    </datacite:creator>
  </datacite:creators>
  <datacite:alternateIdentifiers>
    <datacite:alternateIdentifier alternateIdentifierType="DOI">10.1234/example.doi</datacite:alternateIdentifier>
    <datacite:alternateIdentifier alternateIdentifierType="ISBN">978-3-16-148410-0</datacite:alternateIdentifier>
    <datacite:alternateIdentifier alternateIdentifierType="Handle">12345/6789</datacite:alternateIdentifier>
    <datacite:alternateIdentifier alternateIdentifierType="URN">urn:nbn:de:1234-5678</datacite:alternateIdentifier>
    <datacite:alternateIdentifier alternateIdentifierType="arXiv">2509.17779</datacite:alternateIdentifier>
  </datacite:alternateIdentifiers>
  <dc:language>en</dc:language>
  <datacite:date dateType="Issued">2020-01-01</datacite:date>
  <oaire:resourceType resourceTypeGeneral="literature" uri="http://purl.org/coar/resource_type/c_7a1f">bachelor thesis</oaire:resourceType>
  <dc:description>This is a sample abstract.</dc:description>
  <datacite:identifier identifierType="URL">http://localhost:8000/literature/123456</datacite:identifier>
  <datacite:rights rightsURI="http://purl.org/coar/access_right/c_abf2">open access</datacite:rights>
  <datacite:subjects>
    <datacite:subject>Physics</datacite:subject>
  </datacite:subjects>
  <oaire:file objectType="fulltext">https://inspirehep.net/files/file1.pdf</oaire:file>
  <oaire:file objectType="fulltext">https://inspirehep.net/files/file2.pdf</oaire:file>
  <oaire:citationTitle>JHEP</oaire:citationTitle>
  <oaire:citationVolume>06</oaire:citationVolume>
  <oaire:citationIssue>2</oaire:citationIssue>
  <oaire:citationStartPage>060</oaire:citationStartPage>
  <oaire:citationEndPage>080</oaire:citationEndPage>
  <oaire:citationEdition>First Edition</oaire:citationEdition>
</oaire:resource>
"""
    with patch(
        "inspirehep.oai.converter.get_inspirehep_url",
        return_value="http://localhost:8000",
    ):
        builder = OpenAIREXMLConverter()
        generated_el = builder.get_xml(record)

    expected_el = etree.fromstring(
        expected_xml.encode("utf-8"), parser=etree.XMLParser(remove_blank_text=True)
    )
    assert xml_compare(expected_el, generated_el)
