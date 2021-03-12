from inspirehep.matcher.utils import map_refextract_to_schema


def test_map_refextract_to_schema():
    refextract_input = [
        {
            "author": [u"F. Englert and R. Brout"],
            "doi": [u"doi:10.1103/PhysRevLett.13.321"],
            "journal_page": [u"321"],
            "journal_reference": [u"Phys. Rev. Lett. 13 (1964) 321"],
            "journal_title": [u"Phys. Rev. Lett."],
            "journal_volume": [u"13"],
            "journal_year": [u"1964"],
            "linemarker": [u"1"],
            "raw_ref": [
                u"[1] F. Englert and R. Brout, \u201cBroken symmetry and the mass of gauge vector mesons\u201d, Phys. Rev. Lett. 13 (1964) 321, doi:10.1103/PhysRevLett.13.321."
            ],
            "texkey": [u"Englert:1964et"],
            "year": [u"1964"],
        }
    ]

    expected_output = [
        {
            "reference": {
                "authors": [{"full_name": "Englert, F."}, {"full_name": "Brout, R."}],
                "dois": ["10.1103/PhysRevLett.13.321"],
                "misc": ["Phys. Rev. Lett. 13 (1964) 321"],
                "label": "1",
                "texkey": "Englert:1964et",
                "publication_info": {"year": 1964},
            },
            "raw_refs": [
                {
                    "schema": "text",
                    "value": "[1] F. Englert and R. Brout, “Broken symmetry and the mass of gauge vector mesons”, Phys. Rev. Lett. 13 (1964) 321, doi:10.1103/PhysRevLett.13.321.",
                }
            ],
        }
    ]

    result = map_refextract_to_schema(refextract_input)
    assert result == expected_output
