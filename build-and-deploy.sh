#!/bin/bash -e

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
  image=${1}
  username='inspire-bot'
  token="${INSPIRE_BOT_TOKEN}"

  curl \
    -u "${username}:${token}" \
    -X POST \
    -H "Accept: application/vnd.github.v3+json" \
    -d '{"event_type":"new_image", "client_payload":{"image":"'${image}'", "tag":"'${TAG}'"}}' \
    https://api.github.com/repos/inspirehep/kubernetes/dispatches
}


main() {
  login
  buildPush "." "inspirehep/editor"
  logout
  deployQA "inspirehep/editor"
}
main
