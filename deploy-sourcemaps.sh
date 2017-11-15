npm install -g sentry-cli-binary

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

sentry-cli --auth-token $SENTRY_TOKEN releases new $PACKAGE_VERSION
sentry-cli --auth-token $SENTRY_TOKEN releases files \
  $PACKAGE_VERSION upload-sourcemaps --url-prefix \
  ~/static/node_modules/record-editor ./dist

rm -rf dist/*.js.map