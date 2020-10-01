# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM inspirehep/python:3.6-with-certs
RUN apt update && apt install poppler-utils -y

ENV PATH="/root/.poetry/bin:${PATH}" \
    POETRY_VIRTUALENVS_CREATE=false

ARG POETRY_VERSION
ENV POETRY_VERSION="${POETRY_VERSION:-1.0.1}"
RUN curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python - --version "${POETRY_VERSION}" \
 && poetry --version

WORKDIR /opt/inspire

ENTRYPOINT ["poetry", "run", "inspirehep"]
CMD ["shell"]

COPY poetry.lock pyproject.toml ./
RUN poetry install --no-root

COPY setup.py ./
COPY gunicorn_config.py ./
COPY inspirehep inspirehep/
COPY tests tests/
COPY scripts scripts/
COPY data data/
RUN poetry install

ARG VERSION
ENV VERSION="${VERSION}"
