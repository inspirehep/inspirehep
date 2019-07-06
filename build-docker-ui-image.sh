#!/bin/bash -e
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

GIT_DESC="$(git describe --always || echo)"
# FIXME: We need that for building the ui images with the proper
# SENTRY and PIWIK
[[ "$TRAVIS_BRANCH" == "master" ]] && REF="qa" || REF="master"

echo "Deploying tag for inspirehep-ui ${GIT_DESC}"
echo "Deploying from branch ${REF}"

curl -X POST "${UI_DEPLOY_URL}" \
    -F token=${UI_DEPLOY_TOKEN} \
    -F ref=${REF} \
    -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)" \
    -F "variables[TAG]=${GIT_DESC}" \
    -F "variables[IMAGE_BUILD]=True" \
    -F "variables[DEPLOY]=True"
