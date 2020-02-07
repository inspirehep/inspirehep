#!/bin/bash -e
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

TAG="${TRAVIS_TAG:-$(git describe --always --tags)}"

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
  context="${1}"
  image="${2}"
  echo "Building docker image for ${context}"
  retry docker build \
    --build-arg VERSION="${TAG}" \
    -t "${image}:${TAG}" \
    -t "${image}" \
    "${context}"

  echo "Pushing image to ${image}:${TAG}"
  retry docker push "${image}:${TAG}"
  retry docker push "${image}"
}

logout() {
  echo "Logging out""${@}"
  retry docker logout
}

deployQA() {
  app="${1}"
  if [ -z "${TRAVIS_TAG}" ]; then
    echo "Deploying ${app} ..."
    curl -X POST \
      -F token=${DEPLOY_QA_TOKEN} \
      -F ref=master \
      -F variables[APP_NAME]=${app} \
      -F variables[NEW_TAG]=${TAG} \
      https://gitlab.cern.ch/api/v4/projects/62928/trigger/pipeline
  fi
}

sentryQA() {
  export SENTRY_AUTH_TOKEN=${SENTRY_QA_AUTH_TOKEN}
  export SENTRY_URL="https://sentry.inspirebeta.net"
  export SENTRY_ORG="inspire-qa"
  sentry-cli releases set-commits --auto ${TAG}
}

main() {
  login
  buildPush "ui" "inspirehep/ui"
  buildPush "backend" "inspirehep/hep"
  logout
  deployQA "ui"
  deployQA "hep"
  sentryQA
}
main
