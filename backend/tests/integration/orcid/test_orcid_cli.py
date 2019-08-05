# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""ORCID CLI tests."""

from mock import patch

from inspirehep.orcid.cli import orcid


@patch("inspirehep.orcid.cli.import_legacy_orcid_tokens")
def test_import_legacy_tokens_command(mock_import_orcid, app_cli_runner):
    result = app_cli_runner.invoke(orcid, ["import-legacy-tokens"])

    assert result.exit_code == 0
    mock_import_orcid.assert_called_once()
