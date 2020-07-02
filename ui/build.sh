cd /usr/src/app
PATH=/usr/src/app/node_modules/.bin:$PATH
REACT_APP_VERSION="${VERSION}"
yarn install
yarn run build

