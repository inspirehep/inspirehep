rc=0
files="-f docker-compose.yml -f ./smoke-tests/docker-compose.cypress.yml"

docker wait inspirehep_ui-build_1
docker wait inspirehep_record-editor-build_1

docker-compose $files run -w "/tests" --rm cypress bash -c "yarn && yarn test --browser chrome --headless --env inspirehep_url=http://ui:8080" || rc=$?

docker-compose $files logs --no-color > cypress-container-logs.txt
exit $rc
