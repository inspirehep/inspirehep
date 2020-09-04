files="-f docker-compose.yml -f ./smoke-tests/docker-compose.cypress.yml"
docker-compose $files build --parallel
docker-compose $files up -d --force-recreate
