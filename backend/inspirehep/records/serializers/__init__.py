# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
# flake8: noqa

from .bibtex import literature_bibtex_response, literature_bibtex_response_search
from .json import (
    authors_control_number_only_json_response,
    authors_json_detail_response,
    authors_json_list_response,
    authors_json_response,
    authors_json_response_search,
    experiments_json_response,
    experiments_json_response_search,
    facets_json_response_search,
    institutions_json_response,
    institutions_json_response_search,
    jobs_json_response,
    jobs_json_response_search,
    journals_json_response,
    journals_json_response_search,
    literature_authors_json_response,
    literature_json_detail_response,
    literature_json_list_response,
    literature_json_response,
    literature_json_response_search,
)
from .latex import (
    latex_response_eu,
    latex_response_us,
    literature_latex_eu_response_search,
    literature_latex_us_response_search,
)
