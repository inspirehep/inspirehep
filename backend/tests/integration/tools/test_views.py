# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from freezegun import freeze_time
from helpers.utils import create_record
from werkzeug.datastructures import FileStorage

from inspirehep.files import current_s3_instance
from inspirehep.tools.utils import find_references


@pytest.fixture(scope="function")
def literature_records(inspire_app):
    with freeze_time("2020-06-12"):
        data_ads = {
            "control_number": 1721863,
            "titles": [{"title": "Baryon Number Generation in Grand Unified Theories"}],
            "authors": [{"full_name": "Ellis, John R."}],
            "external_system_identifiers": [
                {"schema": "ADS", "value": "1979PhLB...80..360E"}
            ],
            "texkeys": ["Ellis:1978xg"],
        }
        create_record("lit", data=data_ads)

        data_texkey = {
            "control_number": 1721864,
            "titles": [{"title": "Neutrinoless universe"}],
            "authors": [{"full_name": "Beacom, John F."}],
            "texkeys": ["Beacom:2004yd"],
        }
        create_record("lit", data=data_texkey)

        data_eprint = {
            "control_number": 1721865,
            "titles": [
                {"title": "On-shell recurrence relations for one-loop QCD amplitudes"}
            ],
            "authors": [{"full_name": "Bern, Zvi"}],
            "arxiv_eprints": [{"categories": ["hep-th"], "value": "hep-th/0501240"}],
        }
        create_record("lit", data=data_eprint)

        data_r = {
            "control_number": 1721867,
            "titles": [{"title": "GEANT Detector Description and Simulation Tool"}],
            "authors": [{"full_name": "run, René"}],
            "report_numbers": [{"value": "CERN-W5013"}],
            "texkeys": ["Brun:1994aa"],
        }
        create_record("lit", data=data_r)

        data_r_ambiguous = {
            "control_number": 1721868,
            "titles": [{"title": "This is another record with the same report number"}],
            "authors": [{"full_name": "Garcia, Miguel"}],
            "report_numbers": [{"value": "CERN-W5013"}],
            "texkeys": ["Garcia:2020ab"],
        }
        create_record("lit", data=data_r_ambiguous)


def test_generate_bibliography(inspire_app, s3, literature_records, datadir):
    current_s3_instance.client.create_bucket(Bucket="inspire-tmp")
    with inspire_app.test_client() as client:
        f = open(f"{datadir}/bibliography_generator_test.tex", "rb")
        bytes_file = FileStorage(f)
        data = {"file": bytes_file}
        response = client.post("/bibliography-generator?format=bibtex", data=data)

    response_status_code = response.status_code

    expected_status_code = 200
    expected_errors = [
        {"message": "Ambiguous reference to CERN-W5013 on line 6"},
        {"message": "Reference to Garcia:2020ay not found on line 8"},
    ]

    assert expected_status_code == response_status_code
    assert "download_url" in response.json["data"]
    assert expected_errors == response.json["errors"]


def test_generate_bibliography_with_no_references_found(inspire_app, s3, datadir):
    current_s3_instance.client.create_bucket(Bucket="inspire-tmp")
    with inspire_app.test_client() as client:
        f = open(f"{datadir}/bibliography_generator_test.tex", "rb")
        bytes_file = FileStorage(f)
        data = {"file": bytes_file}
        response = client.post("/bibliography-generator?format=bibtex", data=data)

    response_status_code = response.status_code
    expected_status_code = 400
    assert expected_status_code == response_status_code


def test_find_references(literature_records):
    reference_names = [
        ("1979PhLB...80..360E", 1),
        ("Beacom:2004yd", 1),
        ("hep-th/0501240", 3),
        ("CERN-W5013", 6),
        ("Garcia:2020ay", 8),
    ]

    expected_references_bibtex = [
        '@article{1979PhLB...80..360E,\n    author = "Ellis, John R.",\n    title = "{Baryon Number Generation in Grand Unified Theories}"\n}\n',
        '@article{Beacom:2004yd,\n    author = "Beacom, John F.",\n    title = "{Neutrinoless universe}"\n}\n',
        '@article{hep-th/0501240,\n    author = "Bern, Zvi",\n    title = "{On-shell recurrence relations for one-loop QCD amplitudes}",\n    eprint = "hep-th/0501240",\n    archivePrefix = "arXiv"\n}\n',
    ]

    expected_references_latex_us = [
        "%\\cite{1979PhLB...80..360E}\n\\bibitem{1979PhLB...80..360E}\nJ.~R.~Ellis,\n%``Baryon Number Generation in Grand Unified Theories,''\n%0 citations counted in INSPIRE as of 12 Jun 2020",
        "%\\cite{Beacom:2004yd}\n\\bibitem{Beacom:2004yd}\nJ.~F.~Beacom,\n%``Neutrinoless universe,''\n%0 citations counted in INSPIRE as of 12 Jun 2020",
        "%\\cite{hep-th/0501240}\n\\bibitem{hep-th/0501240}\nZ.~Bern,\n%``On-shell recurrence relations for one-loop QCD amplitudes,''\n[arXiv:hep-th/0501240 [hep-th]].\n%0 citations counted in INSPIRE as of 12 Jun 2020",
    ]

    expected_references_latex_eu = [
        "%\\cite{1979PhLB...80..360E}\n\\bibitem{1979PhLB...80..360E}\nJ.~R.~Ellis,\n%``Baryon Number Generation in Grand Unified Theories,''\n%0 citations counted in INSPIRE as of 12 Jun 2020",
        "%\\cite{Beacom:2004yd}\n\\bibitem{Beacom:2004yd}\nJ.~F.~Beacom,\n%``Neutrinoless universe,''\n%0 citations counted in INSPIRE as of 12 Jun 2020",
        "%\\cite{hep-th/0501240}\n\\bibitem{hep-th/0501240}\nZ.~Bern,\n%``On-shell recurrence relations for one-loop QCD amplitudes,''\n[arXiv:hep-th/0501240 [hep-th]].\n%0 citations counted in INSPIRE as of 12 Jun 2020",
    ]

    expected_errors = [
        {"ref": "CERN-W5013", "line": 6, "type": "ambiguous"},
        {"ref": "Garcia:2020ay", "line": 8, "type": "not found"},
    ]

    references, errors = find_references(reference_names, "bibtex")
    assert references == expected_references_bibtex

    references, errors = find_references(reference_names, "latex_eu")
    assert references == expected_references_latex_eu

    references, errors = find_references(reference_names, "latex_us")
    assert references == expected_references_latex_us

    assert errors == expected_errors
