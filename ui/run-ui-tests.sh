#!/bin/bash -xe
yarn build
cd ui-tests
# sudo chown -R 999 .
rc=0
docker-compose run --rm node || rc=$?
# sudo chown -R $USER .
cd ..
exit $rc
