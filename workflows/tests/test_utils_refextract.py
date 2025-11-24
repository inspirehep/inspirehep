from include.inspire.refextract_utils import (
    extract_references_from_pdf,
    map_refextract_reference_to_schema,
    map_refextract_to_schema,
    raw_refs_to_list,
)
from inspire_schemas.api import load_schema, validate


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
