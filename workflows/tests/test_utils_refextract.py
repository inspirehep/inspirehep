import pytest
from hooks.inspirehep.inspire_http_hook import (
    InspireHttpHook,
)
from include.inspire.refextract_utils import (
    extract_references_from_pdf,
    extract_references_from_text,
    map_refextract_reference_to_schema,
    map_refextract_to_schema,
    match_references_hep,
    raw_refs_to_list,
    sanitize_references,
)
from inspire_schemas.api import load_schema, validate

from tests.test_utils import function_test


class TestRefextract:
    def test_extract_references_from_pdf_handles_unicode(self, datadir):
        schema = load_schema("hep")
        subschema = schema["properties"]["references"]

        filename = str(datadir / "1704.00452.pdf")

        result = extract_references_from_pdf(filename)

        assert validate(result, subschema) is None
        assert len(result) > 0

    def test_extract_references_doesnt_raise_exception_if_dealing_with_xml(
        self, datadir
    ):
        filename = str(datadir / "PhysRevA_104.012407.xml")

        result = extract_references_from_pdf(filename)

        assert result == []

    def test_extract_references_from_pdf_populates_raw_refs_source(self, datadir):
        filename = str(datadir / "1704.00452.pdf")

        result = extract_references_from_pdf(filename, source="arXiv")

        assert result[0]["raw_refs"][0]["source"] == "arXiv"

    def test_raw_refs_to_list_single_text(self):
        reference = {
            "raw_refs": [
                {
                    "schema": "text",
                    "source": "arXiv",
                    "value": "[37] M. Vallisneri, \u201cUse and abuse of the Fisher "
                    "information matrix in the assessment of gravitational-wave"
                    " parameter-estimation prospects,\u201d Phys. Rev. D 77,"
                    " 042001 (2008) doi:10.1103/PhysRevD.77.042001"
                    " [gr-qc/0703086 [GR-QC]].",
                },
            ],
        }

        raw_refs, _ = raw_refs_to_list([reference])
        assert len(raw_refs["values"]) == 1
        assert raw_refs["values"][0] == reference["raw_refs"][0]["value"]

    def test_map_refextract_to_schema(self):
        result = map_refextract_to_schema(
            [
                {
                    "author": ["Pol. B"],
                    "misc": ["Iskra \Ł W et alActa Phys", "48 581"],
                    "raw_ref": ["Iskra \Ł W et al 2017 Acta Phys. Pol. B 48 581"],
                    "year": ["2017"],
                },
                {
                    "author": ["Pol. B"],
                    "misc": ["Iskra \Ł W et alActa Phys", "48 582"],
                    "raw_ref": ["Iskra \Ł W et al 2017 Acta Phys. Pol. B 48 582"],
                    "year": ["2017"],
                },
            ],
            "elsevier",
        )

        assert result[0]["raw_refs"] == [
            {
                "schema": "text",
                "source": "elsevier",
                "value": "Iskra \Ł W et al 2017 Acta Phys. Pol. B 48 581",
            }
        ]
        assert result[0]["reference"] == {
            "authors": [{"full_name": "B, Pol."}],
            "misc": ["Iskra \Ł W et alActa Phys", "48 581"],
            "publication_info": {"year": 2017},
        }
        assert result[1]["raw_refs"] == [
            {
                "schema": "text",
                "source": "elsevier",
                "value": "Iskra \Ł W et al 2017 Acta Phys. Pol. B 48 582",
            }
        ]
        assert result[1]["reference"] == {
            "authors": [{"full_name": "B, Pol."}],
            "misc": ["Iskra \Ł W et alActa Phys", "48 582"],
            "publication_info": {"year": 2017},
        }

    def test_map_refextract_reference_to_schema(self):
        result = map_refextract_reference_to_schema(
            {
                "author": ["Pol. B"],
                "misc": ["Iskra \Ł W et alActa Phys", "48 581"],
                "raw_ref": ["Iskra \Ł W et al 2017 Acta Phys. Pol. B 48 581"],
                "year": ["2017"],
            },
            "elsevier",
        )

        assert result[0]["raw_refs"] == [
            {
                "schema": "text",
                "source": "elsevier",
                "value": "Iskra \Ł W et al 2017 Acta Phys. Pol. B 48 581",
            }
        ]
        assert result[0]["reference"] == {
            "authors": [{"full_name": "B, Pol."}],
            "misc": ["Iskra \Ł W et alActa Phys", "48 581"],
            "publication_info": {"year": 2017},
        }

    def test_raw_refs_to_list_multiple_text_takes_first(self):
        reference = {
            "raw_refs": [
                {
                    "schema": "text",
                    "source": "arXiv",
                    "value": "[37] M. Vallisneri, \u201cUse and abuse of the Fisher "
                    "information matrix",
                },
                {
                    "schema": "text",
                    "source": "somewhere",
                    "value": "Some other content",
                },
            ],
        }

        raw_refs, _ = raw_refs_to_list([reference])

        assert len(raw_refs["values"]) == 1
        assert raw_refs["values"][0] == reference["raw_refs"][0]["value"]
        assert raw_refs["sources"][0] == reference["raw_refs"][0]["source"]

    def test_raw_refs_to_list_wrong_schema(self):
        reference = {
            "raw_refs": [
                {
                    "source": "American Physical Society",
                    "value": (
                        '<ref id="c1"><label>[1]</label>'
                        '<mixed-citation publication-type="journal">'
                        "<object-id>1</object-id><person-group"
                        'person-group-type="author">'
                        "<string-name>Z. Chacko</string-name>, <string-name>H.-S."
                        "Goh</string-name>, and <string-name>R. Harnik</string-name>"
                        "</person-group>,"
                        "<article-title>The Twin Higgs: Natural Electroweak "
                        "Breaking from Mirror Symmetry</article-title>,"
                        "<source>Phys. Rev. Lett.</source> <volume>96</volume>,"
                        " <page-range>231802</page-range>"
                        '(<year>2006</year>).<pub-id pub-id-type="coden">PRLTAO'
                        "</pub-id><issn>0031-9007</issn><pub-id"
                        'pub-id-type="doi" specific-use="suppress-display">'
                        "0.1103/PhysRevLett.96.231802</pub-id></mixed-citation></ref>"
                    ),
                    "schema": "JATS",
                },
            ],
        }

        raw_refs, _ = raw_refs_to_list([reference])
        assert len(raw_refs["values"]) == 0

    def test_raw_refs_to_list_reference_exists(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["references"]

        reference = {
            "raw_refs": [
                {
                    "schema": "text",
                    "source": "arXiv",
                    "value": "[37] M. Vallisneri, \u201cUse and abuse of the Fisher"
                    " information matrix",
                },
            ],
            "reference": {
                "arxiv_eprint": "gr-qc/0703086",
                "authors": [{"full_name": "Vallisneri, M."}],
                "dois": ["10.1103/PhysRevD.77.042001"],
                "label": "37",
                "misc": ["Phys. Rev. D", "77, 042001", "[GR-QC]]"],
                "publication_info": {"year": 2008},
                "texkey": "Vallisneri:2007ev",
                "title": {"title": "Use and abuse of the Fisher information matrix"},
            },
        }

        _, references = raw_refs_to_list([reference])

        assert validate(references, subschema) is None
        assert len(references) == 1
        assert references[0] == reference

    def test_extract_references_from_text_handles_unicode(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["references"]
        text = "Iskra Ł W et al 2017 Acta Phys. Pol. B 48 581"

        result = extract_references_from_text(text)

        assert validate(result, subschema) is None
        assert len(result) > 0

    def test_extract_references_from_text_removes_duplicate_urls(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["references"]

        text = "[4] CALICE Collaboration webpage. http://twiki.cern.ch/CALICE hello http://twiki.cern.ch/CALICE"
        result = extract_references_from_text(text)

        assert validate(result, subschema) is None
        assert len(result[0]["reference"]["urls"]) == 1

    def test_extract_references_from_text_populates_raw_refs_source(self):
        text = "Iskra Ł W et al 2017 Acta Phys. Pol. B 48 581"

        result = extract_references_from_text(text, source="submitter")

        assert result[0]["raw_refs"][0]["source"] == "submitter"

    @pytest.mark.vcr
    def test_match_references_hep(self):
        def _test_match_references_hep():
            references = [
                {
                    "reference": {
                        "authors": [
                            {"full_name": "Banerji, S."},
                            {"full_name": "Meem, M."},
                            {"full_name": "Majumder, A."},
                        ],
                        "label": "2",
                        "misc": ["OSA Continuum 2, 2968-2974"],
                        "title": {
                            "title": "Single flat lens enabling imaging "
                            "in the short-wave infra-red (swir) band"
                        },
                        "publication_info": {"year": 2019},
                    },
                    "raw_refs": [
                        {
                            "schema": "text",
                            "value": "2 S. Banerji, M. Meem, A. Majumder, C. Dvonch,"
                            " B. Sensale-Rodriguez, and R. Menon, “Single flat lens "
                            "enabling imaging in the short-wave infra-red (swir) band",
                            "source": "arXiv",
                        }
                    ],
                }
            ]

            matched_references = match_references_hep(references, InspireHttpHook())

            assert matched_references == references

        function_test(_test_match_references_hep)

    def test_sanitize_references(self):
        references = [
            {
                "reference": {
                    "misc": ["The prediction-powered  (17), i.e., R\u0302PP"]
                },
                "raw_refs": [
                    {
                        "schema": "text",
                        "value": "The prediction-powered  (17), i.e., R\u0302PP",
                        "source": "arXiv",
                    }
                ],
            },
            {
                "raw_refs": [
                    {
                        "schema": "text",
                        "value": "\u0000\u0013 \u0000\u0015\u0013",
                        "source": "arXiv",
                    }
                ]
            },
            {
                "reference": {"misc": ["7LPH6WHSt"]},
                "raw_refs": [
                    {
                        "schema": "text",
                        "value": "\u00007\u0000L\u0000P\u0000S\u0000\u0003t",
                        "source": "arXiv",
                    }
                ],
            },
        ]

        sanitized_references = sanitize_references(references)
        assert len(sanitized_references) == 1
        assert sanitized_references[0] == references[0]
