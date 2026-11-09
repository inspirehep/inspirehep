import pytest
from inspirehep.matcher.utils import (
    compute_author_match_score,
    compute_jaccard_index,
    compute_title_score,
    get_number_of_author_matches,
    get_tokenized_title,
    map_refextract_to_schema,
)


def test_map_refextract_to_schema():
    refextract_input = [
        {
            "author": ["F. Englert and R. Brout"],
            "doi": ["doi:10.1103/PhysRevLett.13.321"],
            "journal_page": ["321"],
            "journal_reference": ["Phys. Rev. Lett. 13 (1964) 321"],
            "journal_title": ["Phys. Rev. Lett."],
            "journal_volume": ["13"],
            "journal_year": ["1964"],
            "linemarker": ["1"],
            "raw_ref": [
                "[1] F. Englert and R. Brout, \u201cBroken symmetry and the mass of"
                " gauge vector mesons\u201d, Phys. Rev. Lett. 13 (1964) 321,"
                " doi:10.1103/PhysRevLett.13.321."
            ],
            "texkey": ["Englert:1964et"],
            "year": ["1964"],
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
                    "value": (
                        "[1] F. Englert and R. Brout, “Broken symmetry and the mass of"
                        " gauge vector mesons”, Phys. Rev. Lett. 13 (1964) 321,"
                        " doi:10.1103/PhysRevLett.13.321."
                    ),
                }
            ],
        }
    ]

    result = map_refextract_to_schema(refextract_input)
    assert result == expected_output


def test_get_number_of_author_matches():
    x_authors = [
        {"full_name": "Cabibbo, Nicola"},
        {"full_name": "Kobayashi, Makoto"},
        {"full_name": "Maskawa, Toshihide"},
    ]

    y_authors = [
        {"full_name": "Kobayashi, Makoto"},
        {"full_name": "Maskawa, Toshihide"},
    ]

    expected = 2
    result = get_number_of_author_matches(x_authors, y_authors)

    assert expected == result


def test_compute_author_match_score_matching_authors():
    x_authors = [
        {"full_name": "Cabibbo, Nicola"},
        {"full_name": "Kobayashi, Makoto"},
        {"full_name": "Maskawa, Toshihide"},
        {"full_name": "Smith, John"},
    ]
    y_authors = [
        {"full_name": "Cabibbo, Nicola"},
        {"full_name": "Kobayashi, Makoto"},
        {"full_name": "Maskawa, Toshihide"},
        {"full_name": "Smith, John"},
    ]

    result = compute_author_match_score(x_authors, y_authors)

    assert result == 1.0


def test_compute_author_match_score_different_authors():
    x_authors = [
        {"full_name": "Cabibbo, Nicola"},
        {"full_name": "Kobayashi, Makoto"},
        {"full_name": "Maskawa, Toshihide"},
        {"full_name": "Smith, John"},
    ]
    y_authors = [
        {"full_name": "Sinatra, Mary"},
        {"full_name": "Blueds, Michael"},
    ]

    result = compute_author_match_score(x_authors, y_authors)

    assert result == 0.0


def test_compute_author_match_score_similar_authors():
    x_authors = [
        {"full_name": "Cabibbo, Nicola"},
        {"full_name": "Kobayashi, Makoto"},
        {"full_name": "Maskawa, Toshihide"},
        {"full_name": "Smith, John"},
    ]
    y_authors = [
        {"full_name": "Kobayashi, Makoto"},
        {"full_name": "Maskawa, Toshihide"},
    ]

    result = compute_author_match_score(x_authors, y_authors)

    assert result == 0.5


@pytest.mark.parametrize(
    ("x_authors", "y_authors", "expected"),
    [
        (
            [
                {"full_name": "Kobayashi, Makoto"},
                {"full_name": "Maskawa, Toshihide"},
            ],
            [],
            1.0,
        ),
        (
            [],
            [
                {"full_name": "Kobayashi, Makoto"},
                {"full_name": "Maskawa, Toshihide"},
            ],
            1.0,
        ),
    ],
)
def test_compute_author_match_one_empty_list(x_authors, y_authors, expected):
    result = compute_author_match_score(x_authors, y_authors)

    assert result == expected


def test_compute_author_match_both_empty_list():
    x_authors = []
    y_authors = []

    result = compute_author_match_score(x_authors, y_authors)

    assert result == 0.0


def test_compute_jaccard_index_perfect_matching_titles():
    title1_tokens = {"cp", "violation", "in", "the", "b", "system"}
    title2_tokens = {"cp", "violation", "in", "the", "b", "system"}

    result = compute_jaccard_index(title1_tokens, title2_tokens)

    assert result == 1.0


def test_compute_jaccard_index_different_titles():
    title1_tokens = {"pythia", "6.4", "physics", "and", "manual"}
    title2_tokens = {"cp", "violation", "in", "the", "b", "system"}

    result = compute_jaccard_index(title1_tokens, title2_tokens)

    assert result == 0.0


def test_compute_jaccard_index_similar_titles():
    title1_tokens = {"cp", "violation", "b"}
    title2_tokens = {"cp", "violation", "in", "the", "b", "system"}

    result = compute_jaccard_index(title1_tokens, title2_tokens)

    assert result == 0.5


def test_compute_jaccard_index_one_empty_set():
    title1_tokens = {}
    title2_tokens = {"cp", "violation", "in", "the", "b", "system"}

    result = compute_jaccard_index(title1_tokens, title2_tokens)

    assert result == 0.0


def test_get_tokenized_title():
    title = "Exotic Exotic RG RG Flows from Holography"

    expected = {"exotic", "rg", "flows", "from", "holography"}

    result = get_tokenized_title(title)

    assert expected == result


def test_compute_title_score_below_threshold():
    title1 = "Some random title"
    title2 = "Some other different title"

    result = compute_title_score(title1, title2, threshold=0.5, math_threshold=0.3)

    assert result == 0.0


def test_compute_title_score_above_threshold():
    title1 = "Some random title"
    title2 = "Some other title"

    result = compute_title_score(title1, title2, threshold=0.5, math_threshold=0.3)

    assert result == 0.5


def test_compute_title_score_above_math_threshold():
    title1 = "Some $\\pi$ title"
    title2 = "Some other different title"

    result = compute_title_score(title1, title2, threshold=0.5, math_threshold=0.3)

    assert result == 0.4


def test_compute_title_score_below_math_threshold():
    title1 = "Some $\\pi$ title"
    title2 = "Some other title that really doesn't match at all"

    result = compute_title_score(title1, title2, threshold=0.5, math_threshold=0.3)

    assert result == 0.0
