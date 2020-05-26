# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from inspirehep.countries.api import Countries


def test_dump_countries(tmpdir, inspire_app, cli):

    countries = Countries()
    result = cli.invoke(["countries", "dump", "-p", tmpdir.strpath])

    assert result.exit_code == 0

    results = tmpdir.listdir()
    results_len = len(results)
    results_code_to_name_file = results[0]
    results_name_to_code_file = results[1]

    assert 2 == results_len

    with open(results_code_to_name_file) as result_file:
        code_to_name = json.load(result_file)
        assert countries.code_to_name == code_to_name

    with open(results_name_to_code_file) as result_file:
        name_to_code = json.load(result_file)
        assert countries.name_to_code == name_to_code
