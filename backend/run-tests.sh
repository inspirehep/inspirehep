#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

./run-code-checks.sh && \
poetry run py.test tests/unit && \
poetry run py.test tests/integration && \
poetry run py.test tests/integration-async
