#!/bin/bash -xe
rc=0
docker-compose -f ./docker-compose.yml -f ./e2e/docker-compose.e2e.yml up --abort-on-container-exit --exit-code-from e2e || rc=$?
exit $rc
