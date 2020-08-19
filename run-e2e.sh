#!/bin/bash -xe
rc=0
files="-f docker-compose.yml -f ./e2e/docker-compose.e2e.yml"
docker-compose $files build --parallel
docker-compose $files up -d --force-recreate
docker-compose $files exec web ./scripts/setup
docker-compose $files exec web-next inspirehep db create
docker-compose $files exec web inspirehep importer records -d data/records/authors
docker-compose $files exec web inspirehep importer records -f data/records/conferences/7577512.json
docker-compose $files exec web inspirehep importer records -f data/records/literature/374836.json
docker wait inspirehep_ui-build_1
docker-compose $files run --rm e2e bash -c "cd /opt/e2e && yarn && yarn test" || rc=$?
exit $rc
