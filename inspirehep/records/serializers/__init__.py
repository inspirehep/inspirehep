# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
# flake8: noqa

from .bibtex import literature_bibtex_response, literature_bibtex_response_search
from .json import (
    authors_control_number_only_json_v1_response,
    authors_json_v1_response,
    facets_json_response_search,
    literature_authors_json_v1_response,
    literature_json_ui_v1_response,
    literature_json_ui_v1_response_search,
    literature_json_v1_response,
    literature_json_v1_response_search,
    literature_references_json_v1_response,
)
from .latex import latex_response_eu, latex_response_us
