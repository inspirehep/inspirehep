#!/bin/bash -e
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

TAG="${TRAVIS_TAG:-$(git describe --always --tags)}"

DEPLOY_TOKEN="${DEPLOY_QA_TOKEN}"
LATEST_COMMIT=$(git rev-parse HEAD)
LATEST_COMMIT_IN_SMOKE_TESTS=$(git log -1 --format=format:%H --full-diff smoke-tests)

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
  retry docker pull "${image}"
  if docker pull "${image}:build-stage"; then
    retry docker build \
    --build-arg VERSION="${TAG}" \
    -t "${image}:build-stage" \
    "${context}" \
    --cache-from "${image}:build-stage" \
    --target "build-stage"
    retry docker push "${image}:build-stage"
    retry docker build \
      --build-arg VERSION="${TAG}" \
      -t "${image}:${TAG}" \
      -t "${image}" \
      "${context}" \
      --cache-from "${image}:build-stage" \
      --cache-from "${image}"
  else
    retry docker build \
      --build-arg VERSION="${TAG}" \
      -t "${image}:${TAG}" \
      -t "${image}" \
      "${context}" \
      --cache-from "${image}"
  fi

  echo "Pushing image to ${image}:${TAG}"
  retry docker push "${image}:${TAG}"
  retry docker push "${image}"
}

logout() {
  echo "Logging out""${@}"
  retry docker logout
}

sentryQA() {
  export SENTRY_AUTH_TOKEN=${SENTRY_QA_AUTH_TOKEN}
  export SENTRY_URL="https://sentry.inspirebeta.net"
  export SENTRY_ORG="inspire-qa"
  sentry-cli releases new -p "ui" -p "hep" ${TAG}
  sentry-cli releases set-commits --auto ${TAG}
}

sentryPROD() {
  export SENTRY_AUTH_TOKEN=${SENTRY_PROD_AUTH_TOKEN}
  export SENTRY_URL="https://sentry.inspirehep.net"
  export SENTRY_ORG="inspire-prod"
  sentry-cli releases new -p "ui" -p "hep" ${TAG}
  sentry-cli releases set-commits --auto ${TAG}
}

maybeBuildSmokeTests() {
  if [ $LATEST_COMMIT = $LATEST_COMMIT_IN_SMOKE_TESTS ]; then
    buildPush "smoke-tests" "inspirehep/smoke-tests"
  else
    echo "Nothing changed on smoke-tests/"
  fi
}

maybeDeploySmokeTestsQA() {
  if [ $LATEST_COMMIT = $LATEST_COMMIT_IN_SMOKE_TESTS ]; then
    # FIXME: smoke tests will replace e2e tests
    deployQA "e2e"
  else
    echo "Nothing changed on smoke-tests/"
  fi
}

deploy() {
  environment=${1}
  image=${2}
  username='inspire-bot'
  token="${INSPIRE_BOT_TOKEN}"

  curl \
    -u "${username}:${token}" \
    -X POST \
    -H "Accept: application/vnd.github.v3+json" \
    -d '{"event_type":"deploy", "client_payload":{"environment":"'${environment}'",image":"'${image}'", "tag":"'${TAG}'"}}' \
    https://api.github.com/repos/inspirehep/kubernetes/dispatches
}

main() {
  login
  buildPush "ui" "inspirehep/ui"
  buildPush "backend" "inspirehep/hep"
  maybeBuildSmokeTests
  logout
  if [ -z "${TRAVIS_TAG}" ]; then
    deploy "qa" "inspirehep/ui"
    deploy "qa" "inspirehep/hep"
    sentryQA
    maybeDeploySmokeTestsQA
  else
    deploy "prod" "inspirehep/ui"
    deploy "prod" "inspirehep/hep"
    sentryPROD
  fi
}
main
