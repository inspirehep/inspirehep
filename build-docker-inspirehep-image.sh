#!/bin/bash -e
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

GIT_DESC="$(git describe --always || echo)"

echo "Deploying tag for inspirehep: ${GIT_DESC}"
curl -X POST "${INSPIREHEP_DEPLOY_URL}" \
    -F token=${INSPIREHEP_DEPLOY_TOKEN} \
    -F ref=master \
    -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)" \
    -F "variables[BRANCH_NAME]=master" \
    -F "variables[APPLICATION_IMAGE_NAME]=inspirehepimage" \
    -F "variables[VERSION]=${GIT_DESC}" \
    -F "variables[DEPLOY]=qa"
