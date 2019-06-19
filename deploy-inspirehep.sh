#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

if [ "$TRAVIS_TAG" ]; then
    echo "Deploying tag ${TRAVIS_TAG}"
    curl -X POST "${INSPIREHEP_DEPLOY_URL}" \
        -F token=${INSPIREHEP_DEPLOY_TOKEN} \
        -F ref=master \
        -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)" \
        -F "variables[TAG_NAME]=${TRAVIS_TAG}" \
        -F "variables[APPLICATION_IMAGE_NAME]=inspirehepimage" \
        -F "variables[VERSION]=${TRAVIS_TAG}" \
        -F "variables[DEPLOY]=qa"
fi

echo "Deploying latest"
curl -X POST "${INSPIREHEP_DEPLOY_URL}" \
    -F token=${INSPIREHEP_DEPLOY_TOKEN} \
    -F ref=master \
    -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)" \
    -F "variables[BRANCH_NAME]=master" \
    -F "variables[APPLICATION_IMAGE_NAME]=inspirehepimage" \
    -F "variables[VERSION]=latest" \
    -F "variables[DEPLOY]=qa"
