# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

FROM inspirehep-base:latest

COPY ./ .
COPY ./docker/uwsgi/ ${INVENIO_INSTANCE_PATH}

RUN ./scripts/bootstrap

USER ${INVENIO_USER_ID}
