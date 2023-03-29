files="-f docker-compose.yml -f ./e2e/docker-compose.cypress.yml"
docker-compose $files exec hep-web ./scripts/setup
docker-compose $files exec next-web inspirehep db create

docker-compose $files exec hep-web inspirehep importer demo-records
