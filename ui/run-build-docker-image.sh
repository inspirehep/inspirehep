#!/bin/bash -xe
docker build -t inspirehep/ui . --no-cache || rc=$?
exit $rc
