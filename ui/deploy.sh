#!/bin/bash -xe
curl -X POST -F token=${DEPLOY_TOKEN} -F ref=qa ${DEPLOY_URL}
