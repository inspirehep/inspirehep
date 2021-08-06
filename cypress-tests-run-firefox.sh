rc=0
files="-f docker-compose.yml -f ./e2e/docker-compose.cypress.yml"

docker-compose $files run -w "/tests" --rm cypress bash -c "yarn && yarn test --browser firefox --headless --env inspirehep_url=http://ui:8080" || rc=$?

docker-compose $files logs --no-color > cypress-containers.log
exit $rc
