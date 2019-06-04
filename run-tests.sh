#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
set -e

if [ "$SUITE" == "all" ]; then
    ./run-code-checks.sh && \
    poetry run py.test tests/unit && \
    poetry run py.test tests/integration && \
    poetry run py.test tests/integration-async && \
    cd ui && yarn && yarn test
fi

if [ "$SUITE" == "lint" ]; then
    ./run-code-checks.sh
fi
if [ "$SUITE" == "unit" ]; then
    poetry run py.test tests/unit
fi
if [ "$SUITE" == "integration" ]; then
    poetry run py.test tests/integration
fi
if [ "$SUITE" == "integration-async" ]; then
    poetry run py.test tests/integration-async
fi
if [ "$SUITE" == "ui" ]; then
    cd ui && yarn && yarn test
fi
