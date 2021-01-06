# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from pathlib import Path

import jinja2

templates_path = str(Path(__file__).parent.resolve() / "templates")

jinja_cv_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(templates_path),
)
jinja_latex_env = jinja2.Environment(
    variable_start_string="\\VAR{",
    variable_end_string="}",
    loader=jinja2.FileSystemLoader(templates_path),
)
