#!/bin/bash -xe
rc=0
alias compose="docker-compose -f ./docker-compose.yml -f ./e2e/docker-compose.e2e.yml"
compose up -d --force-recreate
compose run --rm web ./scripts/setup
compose exec web-next ./scripts/setup_inspire_next
compose stop
compose up --abort-on-container-exit --exit-code-from e2e || rc=$?
exit $rc
