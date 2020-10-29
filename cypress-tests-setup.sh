files="-f docker-compose.yml -f ./e2e/docker-compose.cypress.yml"

(docker-compose $files build --parallel) &

# run installs sequantially until we move different cache foreach
# https://github.com/yarnpkg/yarn/issues/7087#issuecomment-719434163
(cd ui && yarn install)
(cd record-editor && yarn install)

(cd ui && yarn build) &
(cd record-editor && yarn build) &

wait %1 # wait for docker-compose build before up
docker-compose $files up -d --force-recreate &

# wait for everything
wait %1
wait %2
wait %3
wait %4
