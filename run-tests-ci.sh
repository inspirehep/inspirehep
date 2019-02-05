#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

# The script needs ``SUITE`` env variable, set by cill

set -e

if [ "$SUITE" == "unit" ]; then
    pipenv run isort -rc -c -df && \
    pipenv run check-manifest --ignore ".travis-*"  && \
    pipenv run py.test tests/unit
fi

if [ "$SUITE" == "integration" ]; then
    pipenv run py.test tests/integration
fi
