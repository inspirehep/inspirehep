#!/bin/bash -e
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

<<<<<<< HEAD
IMAGE="inspirehep/disambiguation"
=======
IMAGE="inspirehep/author-disambiguation"
>>>>>>> 5629392... docker: Add docker-compose
TAG="$(git describe --always)"

retry() {
    "${@}" || "${@}" || exit 2
}

login() {
  echo "Logging into Docker Hub"
  retry docker login \
      "--username=${DOCKERHUB_USER}" \
      "--password=${DOCKERHUB_PASSWORD}"
}

buildPush() {

  echo "Building docker image"
  retry docker build -t "${IMAGE}:${TAG}" -t "${IMAGE}" "${DOCKER_CONTEXT}"

  echo "Pushing image to ${IMAGE}:${TAG}"
  retry docker push "${IMAGE}:${TAG}"
  retry docker push "${IMAGE}"
}

logout() {
  echo "Logging out""${@}"
  retry docker logout
}

main() {
  login
  buildPush
  logout
}
main
