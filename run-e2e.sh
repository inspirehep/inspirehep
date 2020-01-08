#!/bin/bash -xe
rc=0
docker-compose -f ./docker-compose.core.yml up -d --force-recreate
docker-compose -f ./docker-compose.core.yml exec web ./scripts/setup
docker-compose -f ./docker-compose.core.yml exec web-next inspirehep db create
docker-compose -f ./docker-compose.core.yml exec web inspirehep importer records -d data/records/authors
docker-compose -f ./docker-compose.core.yml exec web inspirehep importer records -f data/records/conference/7577512.json
docker-compose -f ./docker-compose.core.yml -f ./e2e/docker-compose.e2e.yml run --rm e2e bash -c "cd /opt/e2e && yarn && yarn test" || rc=$?
exit $rc
