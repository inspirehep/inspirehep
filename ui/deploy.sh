#!/bin/bash -xe
curl -X POST "${DEPLOY_URL}" \
    -F token=${DEPLOY_TOKEN} \
    -F ref=qa \
    -F "variables[CACHE_DATE]=$(date +%Y-%m-%d:%H:%M:%S)"
