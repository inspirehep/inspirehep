#!/bin/bash -e
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

TAG="${TRAVIS_TAG:-$(git describe --always --tags)}"

IMAGE_UI="inspirehep/ui"
IMAGE_BACKEND="inspirehep/backend"

retry() {
    "${@}" || "${@}" || exit 2
}

login() {
  echo "Logging into Docker Hub"
  retry docker login \
      "--username=${DOCKERHUB_USER}" \
      "--password=${DOCKERHUB_PASSWORD}"
}

buildPushUI() {
  echo "Building docker image for ui"
  retry docker build \
    --build-arg VERSION="${TAG}" \
    -t "${IMAGE_UI}:${TAG}" \
    -t "${IMAGE_UI}" \
    ui

  echo "Pushing image to ${IMAGE_UI}:${TAG}"
  retry docker push "${IMAGE_UI}:${TAG}"
  retry docker push "${IMAGE_UI}"
}

buildPushBackend() {
  echo "Building docker image for backend"
  retry docker build \
    --build-arg VERSION="${TAG}" \
    -t "${IMAGE_BACKEND}:${TAG}" \
    -t "${IMAGE_BACKEND}" \
    backend

  echo "Pushing image to ${IMAGE_BACKEND}:${TAG}"
  retry docker push "${IMAGE_BACKEND}:${TAG}"
  retry docker push "${IMAGE_BACKEND}"
}

logout() {
  echo "Logging out""${@}"
  retry docker logout
}

deployQA() {
  if [ -z "${TRAVIS_TAG}" ]; then
    curl -X POST \
      -F token=${DEPLOY_QA_TOKEN} \
      -F ref=master \
      -F variables[IMAGE_NAME]=inspirehep/ui \
      -F variables[NEW_TAG]=${TAG} \
      https://gitlab.cern.ch/api/v4/projects/62928/trigger/pipeline
  fi
}

main() {
  login
  buildPushUI
  buildPushBackend
  logout
  deployQA
}
main
