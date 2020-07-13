# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM inspirehep/poetry:1.0.0
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
