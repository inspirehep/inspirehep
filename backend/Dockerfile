# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM python:3.6.13

WORKDIR /opt/inspire

ENTRYPOINT ["poetry", "run", "inspirehep"]
CMD ["shell"]

ENV PYTHONBUFFERED=0 \
    SSL_CERT_FILE="/etc/ssl/certs/ca-certificates.crt" \
    REQUESTS_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt" \
    PATH="/root/.poetry/bin:${PATH}" \
    POETRY_VIRTUALENVS_CREATE=false

COPY CERN_Root_Certification_Authority_2.pem /usr/local/share/ca-certificates/CERN_Root_Certification_Authority_2.crt

RUN update-ca-certificates \
 && pip config set global.cert "${REQUESTS_CA_BUNDLE}"

RUN apt update && apt install poppler-utils -y

ARG POETRY_VERSION
ENV POETRY_VERSION="${POETRY_VERSION:-1.0.10}"
RUN curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py \
  | python - --version "${POETRY_VERSION}" \
 && poetry --version

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
