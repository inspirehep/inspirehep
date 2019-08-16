# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
# flake8: noqa

from .authors import (
    authors_control_number_only_json_response,
    authors_json_detail_response,
    authors_json_list_response,
    authors_json_response,
    authors_json_response_search,
)
from .experiments import experiments_json_response, experiments_json_response_search
from .institutions import institutions_json_response, institutions_json_response_search
from .jobs import jobs_json_response, jobs_json_response_search
from .journals import journals_json_response, journals_json_response_search
from .literature import (
    facets_json_response_search,
    literature_authors_json_response,
    literature_json_detail_response,
    literature_json_list_response,
    literature_json_response,
    literature_json_response_search,
    literature_references_json_response,
)
