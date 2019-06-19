#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

if [[ -v TRAVIS_TAG ]]; then
    echo "Deploying tag ${TRAVIS_TAG}"
    curl -X POST "${UI_DEPLOY_URL}" \
        -F token=${UI_DEPLOY_TOKEN} \
        -F ref=qa -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)" \
        -F "variables[TAG]=${TRAVIS_TAG}" \
        -F "variables[IMAGE_BUILD]=True" \
        -F "variables[DEPLOY]=True"
fi

curl -X POST "${UI_DEPLOY_URL}" \
    -F token=${UI_DEPLOY_TOKEN} \
    -F ref=qa \
    -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)" \
    -F "variables[TAG]=latest" \
    -F "variables[IMAGE_BUILD]=True" \
    -F "variables[DEPLOY]=True"

