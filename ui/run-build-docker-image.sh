#!/bin/bash -xe
docker build -t inspirehep/ui . --no-cache -f docker/Dockerfile || rc=$?
exit $rc
