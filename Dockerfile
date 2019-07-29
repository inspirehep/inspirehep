# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM python:3.6.7

ENV PATH="/root/.poetry/bin:$PATH"
WORKDIR /opt/inspire
ENTRYPOINT ["inspirehep"]
CMD ["shell"]

RUN curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python - --preview && \
    poetry --version

COPY poetry.lock pyproject.toml ./

ARG POETRY_EXTRA_ARGS=''

RUN poetry export --without-hashes --format=requirements.txt ${POETRY_EXTRA_ARGS} && \
    pip install -r requirements.txt

COPY setup.py README.md ./
COPY inspirehep inspirehep/
COPY tests tests/
COPY scripts scripts/
COPY data data/

RUN pip install -e .
