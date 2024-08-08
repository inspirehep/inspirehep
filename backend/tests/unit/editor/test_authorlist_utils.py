#
# This file is part of INSPIRE.
# Copyright (C) 2014-2017 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.


import pytest
from inspirehep.editor.authorlist_utils import authorlist, create_authors


def test_create_authors_without_affiliations():
    text = (
        "K. Berkelman, D. Cords, R. Felst, E. Gadermann, G. Grindhammer, "
        "H. Hultschig, P. Joos, W. Koch, U. Kötz, H. Krehbiel, D. Kreinick, "
        "J. Ludwig, K.-H. Mess, K.C. Moffeit, A. Petersen, G. Poelz, "
        "J. Ringel, K. Sauerberg, P. Schmüser, G. Vogel, B.H. Wiik, G. Wolf"
    )

    expected = [
        {"fullname": "K. Berkelman", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "D. Cords", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "R. Felst", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "E. Gadermann", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "G. Grindhammer", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "H. Hultschig", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "P. Joos", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "W. Koch", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "U. Kötz", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "H. Krehbiel", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "D. Kreinick", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "J. Ludwig", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "K.-H. Mess", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "K.C. Moffeit", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "A. Petersen", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "G. Poelz", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "J. Ringel", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "K. Sauerberg", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "P. Schm\xfcser", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "G. Vogel", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "B.H. Wiik", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "G. Wolf", "affiliations": [], "ids": [], "emails": []},
    ]
    result = create_authors(text)

    assert expected == result["authors"]
    assert "Found no affiliations (empty line needed)" in result["warnings"]


def test_create_authors_with_affiliations():
    text = (
        "F. Durães1, A.V. Giannini2, V.P. Gonçalves3,4 and F.S. Navarra2\n"
        " \n"
        "1 CERN\n"
        "2 Fermilab\n"
        "3 Lund University\n"
        "4 Instituto de Física, Universidade de São Paulo"
    )

    expected = [
        {"fullname": "F. Dur\xe3es", "affiliations": ["CERN"], "ids": [], "emails": []},
        {
            "fullname": "A.V. Giannini",
            "affiliations": ["Fermilab"],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "V.P. Gon\xe7alves",
            "affiliations": [
                "Lund University",
                "Instituto de F\xedsica, Universidade de S\xe3o Paulo",
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "F.S. Navarra",
            "affiliations": ["Fermilab"],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]
    assert "warnings" not in result


def test_create_authors_with_no_text():
    text = None

    expected = {}
    result = create_authors(text)

    assert expected == result


def test_create_authors_with_no_firstnames():
    text = "Einstein, Bohr"

    expected = [
        {"fullname": "Einstein", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "Bohr", "affiliations": [], "ids": [], "emails": []},
    ]
    result = create_authors(text)

    assert expected == result["authors"]
    assert "Author without firstname: Einstein" in result["warnings"]


def test_create_authors_with_missing_affid():
    """Test case when `create_authors` thinks every author should have an affid.

    This might happen because someone is missing affid or has a number in
    his/her name so it's tricking `create_authors`.
    """
    text = "A. Einstein, N. Bohr2"

    result = create_authors(text)

    expected = [
        {"fullname": "A. Einstein", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "N. Bohr", "affiliations": [], "ids": [], "emails": []},
    ]
    warning = "Unresolved aff-ID or stray footnote symbol. Problematic author and aff-id: N. Bohr 2"

    assert expected == result["authors"]
    assert warning in result["warnings"]


def test_create_authors_with_affid_but_missing_affiliation():
    """Test case when some author has an affiliation id but no affiliation."""
    text = "A. Einstein1, N. Bohr2\n" "\n" "2 Københavns Universitet"

    result = create_authors(text)

    expected = [
        {"fullname": "A. Einstein", "affiliations": [], "ids": [], "emails": []},
        {
            "fullname": "N. Bohr",
            "affiliations": ["K\xf8benhavns Universitet"],
            "ids": [],
            "emails": [],
        },
    ]
    warning = "Unresolved aff-ID or stray footnote symbol. Problematic author and aff-id: A. Einstein 1"

    assert expected == result["authors"]
    assert warning in result["warnings"]


def test_create_authors_with_invalid_affiliation():
    """Test case when an affiliation has no valid id."""
    text = "A. Einstein1, N. Bohr2\n" "\n" "ETH\n" "2 Københavns Universitet"

    with pytest.raises(ValueError, match="Cannot identify type of affiliations"):
        create_authors(text)


def test_create_authors_with_one_author_missing_affiliation():
    """Test case when some author doesn't have an affiliation."""
    text = "A. Einstein, N. Bohr1,2\n" "\n" "1 ETH\n" "2 Københavns Universitet"

    result = create_authors(text)

    expected = [
        {"fullname": "A. Einstein", "affiliations": [], "ids": [], "emails": []},
        {
            "fullname": "N. Bohr",
            "affiliations": ["ETH", "K\xf8benhavns Universitet"],
            "ids": [],
            "emails": [],
        },
    ]
    warning = "Author without affiliation-id. Problematic author: A. Einstein"

    assert expected == result["authors"]
    assert warning in result["warnings"]


def test_create_authors_ignores_space_between_authors_and_affiliations():
    text = "F. Lastname1, F.M. Otherlastname1,2\n" "\n" "1 CERN\n" "2 Otheraffiliation"

    expected = [
        {"fullname": "F. Lastname", "affiliations": ["CERN"], "ids": [], "emails": []},
        {
            "fullname": "F.M. Otherlastname",
            "affiliations": ["CERN", "Otheraffiliation"],
            "ids": [],
            "emails": [],
        },
    ]

    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_bad_author_lines():
    text = (
        "A. Aduszkiewicz\n"
        "1\n"
        ", Y.X. Ali\n"
        "1,20\n"
        ", E I Andronov\n"
        "20\n"
        ", Einstein\n"
        "13,15\n"
        "\n"
        "1 CERN\n"
        "20 DESY\n"
        "13 ETH ZÜRICH\n"
        "15 PRINCETON\n"
    )

    expected = [
        {
            "fullname": "A. Aduszkiewicz",
            "affiliations": ["CERN"],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "Y.X. Ali",
            "affiliations": ["CERN", "DESY"],
            "ids": [],
            "emails": [],
        },
        {"fullname": "E I Andronov", "affiliations": ["DESY"], "ids": [], "emails": []},
        {
            "fullname": "Einstein",
            "affiliations": ["ETH Z\xdcRICH", "PRINCETON"],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_no_commas_between_authors():
    text = (
        "C. Patrignani1 K. Agashe2 G. Aielli1,2\n"
        "\n"
        "1 Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy\n"
        "2 University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
    )

    expected = [
        {
            "fullname": "C. Patrignani",
            "affiliations": [
                "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "K. Agashe",
            "affiliations": [
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "G. Aielli",
            "affiliations": [
                "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy",
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA",
            ],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_newlines_and_no_commas_between_authors():
    text = (
        "C. Patrignani\n"
        "1\n"
        "K. Agashe\n"
        "2\n"
        "G. Aielli\n"
        "1,\n"
        "2\n"
        "\n"
        "1\n"
        "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy\n"
        "2\n"
        "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
    )

    expected = [
        {
            "fullname": "C. Patrignani",
            "affiliations": [
                "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "K. Agashe",
            "affiliations": [
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "G. Aielli",
            "affiliations": [
                "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy",
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA",
            ],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_affids_with_dots():
    text = (
        "C. Patrignani\n"
        "1,\n"
        "K. Agashe\n"
        "2,\n"
        "G. Aielli\n"
        "1,\n"
        "2\n"
        "\n"
        "1.\n"
        "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy\n"
        "2.\n"
        "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
    )

    expected = [
        {
            "fullname": "C. Patrignani",
            "affiliations": [
                "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "K. Agashe",
            "affiliations": [
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "G. Aielli",
            "affiliations": [
                "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy",
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA",
            ],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_no_commas_between_affids():
    text = (
        "C. Patrignani\n"
        "1,\n"
        "K. Agashe\n"
        "2,\n"
        "G. Aielli\n"
        "1\n"
        "2\n"
        "\n"
        "1.\n"
        "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy\n"
        "2.\n"
        "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
    )

    expected = [
        {
            "fullname": "C. Patrignani",
            "affiliations": [
                "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "K. Agashe",
            "affiliations": [
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "G. Aielli",
            "affiliations": [
                "Universita di Bologna and INFN, Dip. Scienze per la Qualita della Vita, I-47921, Rimini, Italy",
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA",
            ],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_multiple_affiliations_on_single_line():
    text = (
        "Y.X. Ali\n"
        "1,20\n"
        ", E I Andronov\n"
        "20\n"
        ", Einstein\n"
        "13,15\n"
        "\n"
        "1 CERN\n"
        "20 DESY\n"
        "13 ETH ZÜRICH15PRINCETON\n"
    )

    expected = [
        {
            "fullname": "Y.X. Ali",
            "affiliations": ["CERN", "DESY"],
            "ids": [],
            "emails": [],
        },
        {"fullname": "E I Andronov", "affiliations": ["DESY"], "ids": [], "emails": []},
        {
            "fullname": "Einstein",
            "affiliations": ["ETH Z\xdcRICH15PRINCETON"],
            "ids": [],
            "emails": [],
        },
    ]
    warning = "Unresolved aff-ID or stray footnote symbol. Problematic author and aff-id: Einstein 15"

    result = create_authors(text)

    assert expected == result["authors"]
    assert warning in result["warnings"]


def test_create_authors_space_between_affids():
    text = "Y.X. Ali1, 20, E I Andronov20\n" "\n" "1 CERN\n" "20 DESY"

    expected = [("Y.X. Ali", ["CERN", "DESY"]), ("E I Andronov", ["DESY"])]
    expected = [
        {
            "fullname": "Y.X. Ali",
            "affiliations": ["CERN", "DESY"],
            "ids": [],
            "emails": [],
        },
        {"fullname": "E I Andronov", "affiliations": ["DESY"], "ids": [], "emails": []},
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_affiliation_with_numbers_and_letters():
    text = (
        "O. Buchmueller\n"
        "1\n"
        "K. Agashe\n"
        "2\n"
        "\n"
        "1.\n"
        "High Energy Physics Group, Blackett Laboratory, Imperial College, Prince Consort Road, London SW7 2AZ, UK\n"
        "2.\n"
        "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA\n"
    )

    expected = [
        {
            "fullname": "O. Buchmueller",
            "affiliations": [
                "High Energy Physics Group, Blackett Laboratory, Imperial College, Prince Consort Road, London SW7 2AZ, UK"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "K. Agashe",
            "affiliations": [
                "University of Maryland, Department of Physics, College Park, MD 20742-4111, USA"
            ],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_note_footnotes():
    """Test authors which have some footnote symbols like † and ∗"""
    text = "Y.X. Ali†1, 20, E I Andronov20∗\n" "\n" "1 CERN\n" "20 DESY"

    expected = expected = [
        {
            "fullname": "Y.X. Ali",
            "affiliations": ["CERN", "DESY"],
            "ids": [],
            "emails": [],
        },
        {"fullname": "E I Andronov", "affiliations": ["DESY"], "ids": [], "emails": []},
    ]
    warning = "Unresolved aff-ID or stray footnote symbol. Problematic author and aff-id: Y.X. Ali †"
    result = create_authors(text)

    assert expected == result["authors"]
    assert warning in result["warnings"]


def test_create_authors_note_symbols():
    """Test authors which have symbols like † and ∗"""
    text = "Y.X. Aduszkiewicž†1, 20, E I Andronov20∗\n" "\n" "† CERN\n" "∗ DESY"

    expected = [
        {
            "fullname": "Y.X. Aduszkiewic\u017e",
            "affiliations": ["CERN"],
            "ids": [],
            "emails": [],
        },
        {"fullname": "E I Andronov", "affiliations": ["DESY"], "ids": [], "emails": []},
    ]
    warning = "CAUTION! Using symbols (# and stuff) as aff-IDs."
    result = create_authors(text)

    assert expected == result["authors"]
    assert warning in result["warnings"]


def test_create_authors_comma_wrong_position():
    """Test case when there is comma before affiliation id."""
    text = (
        "Y. Bao,\n"
        "1\n"
        "and A. Lambrecht,\n"
        "1,\n"
        "2\n"
        "\n"
        "1\n"
        "Department of Physics, University of Florida, Gainesville, Florida 32611\n"
        "2\n"
        "Laboratoire Kastler-Brossel, CNRS, ENS, Universit ́e Pierre et Marie Curie case 74, Campus Jussieu, F-75252 Paris Cedex 05, France\n"
    )

    expected = [
        (
            "Y. Bao",
            [
                "Department of Physics, University of Florida, Gainesville, Florida 32611"
            ],
        ),
        (
            "A. Lambrecht",
            [
                "Department of Physics, University of Florida, Gainesville, Florida 32611",
                "Laboratoire Kastler-Brossel, CNRS, ENS, Universit \u0301e Pierre et Marie Curie case 74, Campus Jussieu, F-75252 Paris Cedex 05, France",
            ],
        ),
    ]
    expected = [
        {
            "fullname": "Y. Bao",
            "affiliations": [
                "Department of Physics, University of Florida, Gainesville, Florida 32611"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "A. Lambrecht",
            "affiliations": [
                "Department of Physics, University of Florida, Gainesville, Florida 32611",
                "Laboratoire Kastler-Brossel, CNRS, ENS, Universit \u0301e Pierre et Marie Curie case 74, Campus Jussieu, F-75252 Paris Cedex 05, France",
            ],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_when_aff_line_ends_in_number():
    text = (
        "T.M. Liss\n"
        "1\n"
        "L. Littenberg\n"
        "2\n"
        "\n"
        "1.\n"
        "Division of Science, City College of New York, 160 Convent Avenue, New York, NY 10031\n"
        "2.\n"
        "Physics Department, Brookhaven National Laboratory, Upton, NY 11973, USA"
    )

    expected = [
        {
            "fullname": "T.M. Liss",
            "affiliations": [
                "Division of Science, City College of New York, 160 Convent Avenue, New York, NY 10031"
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "L. Littenberg",
            "affiliations": [
                "Physics Department, Brookhaven National Laboratory, Upton, NY 11973, USA"
            ],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_with_many_affiliations():
    text = (
        "F. Durães1,2,3,4\n"
        "\n"
        "1 CERN\n"
        "2 Fermilab\n"
        "3 Lund University\n"
        "4 Instituto de Física, Universidade de São Paulo"
    )

    expected = [
        {
            "fullname": "F. Dur\xe3es",
            "affiliations": [
                "CERN",
                "Fermilab",
                "Lund University",
                "Instituto de F\xedsica, Universidade de S\xe3o Paulo",
            ],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_handles_spaces_at_the_end_of_an_author_or_affiliation():
    text = "J. Smith1 \n" "\n" "1 University of somewhere "

    expected = [("J. Smith", ["University of somewhere"])]
    expected = [
        {
            "fullname": "J. Smith",
            "affiliations": ["University of somewhere"],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]


def test_create_authors_with_letters():
    text = "J. Mills a L. di Caprio\n" "B. Smith bb\n" "\n" "a CERN\n" "bb Fermilab\n"

    expected = [
        {
            "fullname": "J. Mills",
            "affiliations": [
                "CERN",
            ],
            "ids": [],
            "emails": [],
        },
        {"fullname": "L. di Caprio", "affiliations": [], "ids": [], "emails": []},
        {
            "fullname": "B. Smith",
            "affiliations": [
                "Fermilab",
            ],
            "ids": [],
            "emails": [],
        },
    ]
    warnings = [
        'Is this part of a name or missing aff-id? "di" in a L. di Caprio',
        "Author without affiliation-id. Problematic author: L. di Caprio",
    ]

    result = create_authors(text)

    assert expected == result["authors"]
    assert all(warning in result["warnings"] for warning in warnings)


def test_create_authors_unused_affiliation():
    text = "K. Sachs 1, F. Schwennsen 1\n" "\n" "1 DESY\n" "2 CERN\n"

    expected = [
        {
            "fullname": "K. Sachs",
            "affiliations": [
                "DESY",
            ],
            "ids": [],
            "emails": [],
        },
        {
            "fullname": "F. Schwennsen",
            "affiliations": ["DESY"],
            "ids": [],
            "emails": [],
        },
    ]
    result = create_authors(text)

    assert expected == result["authors"]
    assert "Unused affiliation-IDs: ['2']" in result["warnings"]


def test_create_authors_no_empty_line():
    text = (
        "K. Sachs1, M. Moskovic2\n"
        "1 DESY, D 22607 Hamburg, Germany\n"
        "2 CERN, CH 1211 Geneva 23, Switzerland\n"
    )

    expected = [
        {"fullname": "K. Sachs", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "M. Moskovic", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "DESY", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "D", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "Hamburg", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "Germany", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "CERN", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "CH", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "Geneva", "affiliations": [], "ids": [], "emails": []},
        {"fullname": "Switzerland", "affiliations": [], "ids": [], "emails": []},
    ]
    result = create_authors(text)

    assert expected == result["authors"]
    assert "Found no affiliations (empty line needed)" in result["warnings"]


def test_create_authors_author_blocks_by_affiliation():
    text = (
        "K. Sachs, F. Schwennsen\n"
        "DESY, D 22607 Hamburg, Germany\n"
        "\n"
        "A. Holtkamp, M. Moskovic\n"
        "CERN, CH 1211 Geneva 23, Switzerland\n"
        "\n"
        "T. Schwander\n"
        "SLAC, Stanford, USA\n"
    )

    with pytest.raises(ValueError, match="Authors grouped by affiliation?"):
        create_authors(text)


def test_create_authors_with_affiliation_get_emails_and_orcid():
    text = (
        "Dan Hooper\n"
        "1,2,3,4\n"
        "Aurora Ireland\n"
        "3,5,6\n"
        "Gordan Krnjaic\n"
        "1,2,3,7\n"
        "\n"
        "1 john.smith@example.org\n"
        "2 jane.smith@example.org\n"
        "3 Fermi National Accelerator Laboratory,Theoretical Astrophysics Group,Batavia,IL,US\n"
        "4 0000-0001-8837-4127\n"
        "5 University of Chicago,Department of Physics,Chicago IL,USA\n"
        "6 0000-0002-3004-0930\n"
        "7 0000-0001-7420-9577\n"
    )

    expected = [
        {
            "full_name": "Hooper, Dan",
            "raw_affiliations": [
                {
                    "value": "Fermi National Accelerator Laboratory,Theoretical Astrophysics Group,Batavia,IL,US",
                }
            ],
            "emails": ["john.smith@example.org", "jane.smith@example.org"],
            "ids": [
                {
                    "schema": "ORCID",
                    "value": "0000-0001-8837-4127",
                }
            ],
        },
        {
            "full_name": "Ireland, Aurora",
            "raw_affiliations": [
                {
                    "value": "Fermi National Accelerator Laboratory,Theoretical Astrophysics Group,Batavia,IL,US",
                },
                {"value": "University of Chicago,Department of Physics,Chicago IL,USA"},
            ],
            "ids": [
                {
                    "schema": "ORCID",
                    "value": "0000-0002-3004-0930",
                }
            ],
        },
        {
            "full_name": "Krnjaic, Gordan",
            "raw_affiliations": [
                {
                    "value": "Fermi National Accelerator Laboratory,Theoretical Astrophysics Group,Batavia,IL,US",
                }
            ],
            "emails": ["john.smith@example.org", "jane.smith@example.org"],
            "ids": [
                {
                    "schema": "ORCID",
                    "value": "0000-0001-7420-9577",
                }
            ],
        },
    ]

    result = authorlist(text)
    assert expected == result["authors"]
    assert "warnings" not in result


def test_create_authors_with_affiliation_authorlist():
    text = (
        "Dan Hooper\n"
        "1\n"
        "Aurora Ireland\n"
        "1,2\n"
        "\n"
        "1 Fermi National Accelerator Laboratory,Theoretical Astrophysics Group,Batavia,IL,US\n"
        "2 University of Chicago,Department of Physics,Chicago IL,USA\n"
    )

    expected = [
        {
            "full_name": "Hooper, Dan",
            "raw_affiliations": [
                {
                    "value": "Fermi National Accelerator Laboratory,Theoretical Astrophysics Group,Batavia,IL,US",
                }
            ],
        },
        {
            "full_name": "Ireland, Aurora",
            "raw_affiliations": [
                {
                    "value": "Fermi National Accelerator Laboratory,Theoretical Astrophysics Group,Batavia,IL,US",
                },
                {"value": "University of Chicago,Department of Physics,Chicago IL,USA"},
            ],
        },
    ]
    result = authorlist(text)
    assert expected == result["authors"]
    assert "warnings" not in result
