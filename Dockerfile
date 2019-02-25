# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM python:3.6

RUN pip install pipenv

WORKDIR /opt/inspire

COPY Pipfile Pipfile.lock setup.py README.md /opt/inspire/
COPY  inspirehep/version.py /opt/inspire/inspirehep/

# install dependencies
RUN pipenv install --skip-lock

COPY inspirehep/ /opt/inspire/inspirehep

# install application
RUN pipenv install --skip-lock -e .
