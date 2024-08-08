#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from helpers.utils import create_record
from lxml.etree import XMLSyntaxError
from mock import patch


def test_bibtex(inspire_app):
    headers = {"Accept": "application/x-bibtex"}
    data = {"titles": [{"title": "This is a title."}]}
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = (
        f'@article{{{record_control_number},\n    title = "{{This is a title.}}"\n}}\n'
    )
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_bibtex_returns_all_expected_fields_for_conference_papers(inspire_app):
    headers = {"Accept": "application/x-bibtex"}

    conference_data = {
        "_collections": ["Conferences"],
        "titles": [{"title": "This is the parent conference title"}],
    }
    rec = create_record("con", data=conference_data)

    conf_paper_data = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "Smith, John", "inspire_roles": ["editor"]},
            {"full_name": "Rossi, Maria", "inspire_roles": ["author"]},
        ],
        "titles": [{"title": "This is a conference paper title"}],
        "document_type": ["conference paper"],
        "texkeys": ["Smith:2019abc"],
        "publication_info": [
            {
                "conference_record": {
                    "$ref": f"http://labs.inspirehep.net/api/conferences/{rec['control_number']}"
                }
            }
        ],
    }
    record = create_record("lit", data=conf_paper_data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = '@inproceedings{Smith:2019abc,\n    author = "Rossi, Maria",\n    editor = "Smith, John",\n    booktitle = "{This is the parent conference title}",\n    title = "{This is a conference paper title}"\n}\n'
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert sorted(expected_result) == sorted(response_data)


def test_bibtex_returns_all_expected_fields_for_book_chapters(inspire_app):
    headers = {"Accept": "application/x-bibtex"}

    book_data = {
        "_collections": ["Literature"],
        "titles": [{"title": "This is the parent book title"}],
    }
    rec = create_record("lit", data=book_data)

    book_chapter_data = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "Smith, John", "inspire_roles": ["editor"]},
            {"full_name": "Rossi, Maria", "inspire_roles": ["author"]},
        ],
        "titles": [{"title": "This is a book chapter title"}],
        "document_type": ["book chapter"],
        "texkeys": ["Smith:2019abc"],
        "publication_info": [
            {
                "parent_record": {
                    "$ref": f"http://labs.inspirehep.net/api/literature/{rec['control_number']}"
                }
            }
        ],
    }
    record = create_record("lit", data=book_chapter_data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = '@inbook{Smith:2019abc,\n    author = "Rossi, Maria",\n    editor = "Smith, John",\n    booktitle = "{This is the parent book title}",\n    title = "{This is a book chapter title}"\n}\n'
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert sorted(expected_result) == sorted(response_data)


def test_bibtex_search(inspire_app):
    headers = {"Accept": "application/x-bibtex"}
    data_1 = {"titles": [{"title": "This is a title."}]}
    data_2 = {
        "titles": [{"title": "Yet another title."}],
    }
    rec1 = create_record("lit", data=data_1)
    rec2 = create_record("lit", data=data_2)

    expected_status_code = 200
    expected_result_1 = (
        f"@article{{{rec1['control_number']},\n"
        '    title = "{This is a title.}"\n'
        "}\n"
    )
    expected_result_2 = (
        f"@article{{{rec2['control_number']},\n"
        '    title = "{Yet another title.}"\n'
        "}\n"
    )
    with inspire_app.test_client() as client:
        response = client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result_1 in response_data
    assert expected_result_2 in response_data


def test_bibtex_encodes_non_latex_chars_in_non_verbatim_fields(inspire_app):
    headers = {"Accept": "application/x-bibtex"}
    data = {
        "texkeys": ["Gerard2020:abc"],
        "titles": [{"title": "About γ-ray bursts"}],
        "authors": [{"full_name": "Gérard, Paweł"}],
        "collaborations": [{"value": "DAΦNE"}],
        "publication_info": [
            {
                "journal_title": "Annales H.Poincaré",
                "journal_volume": "42",
                "page_start": "314",
                "page_end": "486",
            }
        ],
        "dois": [{"value": "10.1234/567_89"}],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = '@article{Gerard2020:abc,\n    author = "G\\\'erard, Pawe\\l{}",\n    collaboration = "DA\\ensuremath{\\Phi}NE",\n    title = "{About \\ensuremath{\\gamma}-ray bursts}",\n    doi = "10.1234/567_89",\n    journal = "Annales H. Poincar\\\'e",\n    volume = "42",\n    pages = "314--486"\n}\n'
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_literature_detail_bibtex_link_alias_format(inspire_app):
    expected_status_code = 200
    record = create_record("lit")
    expected_content_type = "application/x-bibtex"
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=bibtex")
    assert response.status_code == expected_status_code
    assert response.content_type == expected_content_type


def test_bibtex_strips_mathml(inspire_app):
    data = {
        "titles": [
            {
                "title": 'Inert Higgs Dark Matter for CDF II <math display="inline"><mi>W</mi></math>-Boson Mass and Detection Prospects'
            }
        ],
    }
    record = create_record("lit", data=data)

    expected_data = f'@article{{{record["control_number"]},\n    title = "{{Inert Higgs Dark Matter for CDF II W-Boson Mass and Detection Prospects}}"\n}}\n'
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=bibtex")
    assert response.get_data(as_text=True) == expected_data


def test_bibtex_strips_mathml_with_and_in_title(inspire_app):
    data = {
        "titles": [
            {
                "title": 'Inert Higgs & Dark Matter for CDF II <math display="inline"><mi>W</mi></math>-Boson Mass and Detection Prospects'
            }
        ],
    }
    record = create_record("lit", data=data)

    expected_data = f'@article{{{record["control_number"]},\n    title = "{{Inert Higgs \& Dark Matter for CDF II W-Boson Mass and Detection Prospects}}"\n}}\n'  # noqa W605
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=bibtex")
    assert response.get_data(as_text=True) == expected_data


@patch("inspirehep.records.marshmallow.literature.bibtex.remove_tags")
def test_bibtex_leaves_mathml_in_title_when_conversion_error(
    mock_remove_tags, inspire_app
):
    class CustomException(XMLSyntaxError):
        def __init__(filename="test", lineno=1, msg="text", offset=1):
            pass

    mock_remove_tags.side_effect = CustomException

    data = {
        "titles": [
            {
                "title": 'Inert Higgs & Dark Matter for CDF II <math display="inline"><mi>W</mi></math>-Boson Mass and Detection Prospects'
            }
        ],
    }
    record = create_record("lit", data=data)

    expected_data = f"@article{{{record['control_number']},\n    title = \"{{Inert Higgs \\& Dark Matter for CDF II \\ensuremath{{<}}math display=''inline''\\ensuremath{{>}}\\ensuremath{{<}}mi\\ensuremath{{>}}W\\ensuremath{{<}}/mi\\ensuremath{{>}}\\ensuremath{{<}}/math\\ensuremath{{>}}-Boson Mass and Detection Prospects}}\"\n}}\n"
    with inspire_app.test_client() as client:
        response = client.get(f"/literature/{record['control_number']}?format=bibtex")
    assert response.get_data(as_text=True) == expected_data
