# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM registry.cern.ch/cern-sis/base-images/python:3.11

WORKDIR /opt/inspire

ENTRYPOINT ["poetry", "run", "inspirehep"]
CMD ["shell"]

ENV PYTHONBUFFERED=0 \
    SSL_CERT_FILE="/etc/ssl/certs/ca-certificates.crt" \
    REQUESTS_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt" \
    PATH="/root/.local/bin:${PATH}" \
    POETRY_VIRTUALENVS_CREATE=false

COPY CERN_Root_Certification_Authority_2.pem /usr/local/share/ca-certificates/CERN_Root_Certification_Authority_2.crt

RUN apt-get update && \
    apt-get install -y libpq-dev poppler-utils && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates && \
    pip config set global.cert "${REQUESTS_CA_BUNDLE}"

RUN curl -sSL https://install.python-poetry.org | python3.11 - --version 1.8.3 && poetry --version
COPY poetry.lock pyproject.toml ./
RUN poetry install --no-root

COPY gunicorn_config.py ./
COPY inspirehep inspirehep/
COPY tests tests/
COPY scripts scripts/
COPY data data/

ARG VERSION
ENV VERSION="${VERSION}"

RUN poetry install
