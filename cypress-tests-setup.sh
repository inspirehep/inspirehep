files="-f docker-compose.yml -f ./e2e/docker-compose.cypress.yml"
docker-compose $files build --parallel
docker-compose $files up -d --force-recreate
