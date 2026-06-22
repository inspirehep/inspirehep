cd /usr/src/app
PATH=/usr/src/app/node_modules/.bin:$PATH
VITE_APP_VERSION="${VERSION}"
yarn install
yarn build
