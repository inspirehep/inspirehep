#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

VERSION=${1:-"latest"}
echo "Deploying $VERSION version."

if [ "$VERSION" != "latest" ]; then
        curl -X POST "${INSPIREHEP_DEPLOY_URL}" \
        -F token=${INSPIREHEP_DEPLOY_TOKEN} \
        -F ref=master \
        -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)" \
        -F "variables[TAG_NAME]=${VERSION}" \
        -F "variables[APPLICATION_IMAGE_NAME]=inspirehepimage" \
        -F "variables[VERSION]=${VERSION}" \
        -F "variables[DEPLOY]=qa"
else
    curl -X POST "${INSPIREHEP_DEPLOY_URL}" \
        -F token=${INSPIREHEP_DEPLOY_TOKEN} \
        -F ref=master \
        -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)" \
        -F "variables[BRANCH_NAME]=master" \
        -F "variables[APPLICATION_IMAGE_NAME]=inspirehepimage" \
        -F "variables[VERSION]=latest" \
        -F "variables[DEPLOY]=qa"
fi
