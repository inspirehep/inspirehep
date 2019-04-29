# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM python:3.6

RUN pip install poetry==0.12.11

WORKDIR /opt/inspire

COPY . /opt/inspire

# install dependencies
RUN ./scripts/bootstrap
