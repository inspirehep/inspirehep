# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM inspirehep/poetry:1.0.0b1

CMD [ "run", "inspire-disambiguation", "cluster" ]

WORKDIR /opt/disambiguation

COPY . .

RUN poetry install
