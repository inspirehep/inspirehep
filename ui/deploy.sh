#!/bin/bash -xe
curl -X POST "${UI_DEPLOY_URL}" \
    -F token=${UI_DEPLOY_TOKEN} \
    -F ref=qa \
    -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)"
