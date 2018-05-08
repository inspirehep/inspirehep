#!/bin/bash -xe
docker build -t react-docker-app . --no-cache -f docker/Dockerfile || rc=$?
exit $rc
