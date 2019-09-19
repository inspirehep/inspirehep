# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM jonatkinson/python-poetry:3.6

RUN mkdir -p /opt/disambiguation
WORKDIR /opt/disambiguation
COPY poetry.lock poetry.lock
COPY pyproject.toml pyproject.toml
COPY . .
RUN poetry install
