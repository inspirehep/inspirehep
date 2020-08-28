# Inspirehep

## Pre requirements

### Python

Python `3.6`, `3.7`

#### Debian / Ubuntu

```bash
$ sudo apt-get install python3 build-essential python3-dev
```

#### MacOS

```bash
$ brew install python
```

### nodejs & npm using nvm

Please follow the instructions https://github.com/nvm-sh/nvm#installing-and-updating

We're using `v10.14.0` (first version we install is the default)

```
$ nvm install 10.14.0
```

### yarn

#### Debian / Ubuntu

Please folow the instructions https://classic.yarnpkg.com/en/docs/install/#debian-stable

#### MacOS

```bash
$ brew install yarn
```

### poetry

install `poetry` https://poetry.eustace.io/docs/

```bash
$ curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python -
```

### pre-commit

install `pre-commit` https://pre-commit.com/

```bash
$ curl https://pre-commit.com/install-local.py | python -
```

And run

```bash
$ pre-commit install
```

### nginx

#### Debian / Ubuntu

Please follow the instractions https://www.nginx.com/resources/wiki/start/topics/tutorials/install/

```bash
$ apt-get update
$ apt-get install nginx
```

#### macOS:

```bash
$ brew install nginx
```

Add the following configuration:

```nginx
server {
  listen 8080 default_server;
  server_name  _;

  location / {
    proxy_pass  http://localhost:3000/api;
    proxy_set_header Host localhost:3000;
    proxy_http_version 1.1;
  }

  location /api {
    proxy_pass         http://localhost:8000/api;
    proxy_set_header Host localhost:8000;
    proxy_http_version 1.1;
  }
}
```

* On macOS `/usr/local/etc/nginx/nginx.conf`
* On Debian / Ubuntu `/etc/nginx/conf.d/default.conf`

And reload `nginx`

```bash
$ nginx -s reload
```

### Docker & Docker Compose

Follow the guide https://docs.docker.com/compose/install/

---

## Installation

### Backend

```bash
$ cd backend
$ poetry install
```

### UI

```bash
$ cd ui
$ yarn install
```

---

## Setup

First you need to start all the services (postgreSQL, Redis, ElasticSearch, RabbitMQ)

```bash
$ docker-compose -f docker-compose.travis.yml up -d
```

And initialize database and ES

```bash
$ cd backend
$ ./scripts/setup
```

---

## Run

### Backend

You can visit Backend http://localhost:8000

```bash
$ cd backend
$ ./scripts/server
```

### UI

You can visit UI http://localhost:3000

```bash
$ cd ui
$ yarn start
```

You can also connect UI to another environment by changing the proxy a server by changing the `ui/package.json`

```json
{
  ...
  "proxy": "http://A_PROXY_SERVER",
  ...
}
```

Both backend and UI are accessible http://localhost:8080

---

## How to test

### Backend

```bash
$ cd backend
$ ./run-tests.sh
```

Or you can run specific tests:

```bash
$ poetry run py.test tests/unit
$ poetry run py.test tests/integration
$ poetry run py.test tests/integration-async
```

#### Run Code Checks

Run `isort` and `flake8` checks.

```bash
$ ./run-code-checks.sh
```

### UI

```bash
$ cd ui
$ yarn test # runs everything (lint, bundlesize etc.) indentical to CI
$ yarn test:unit # will open jest on watch mode
```

Note that `jest` automatically run tests that changed files (unstaged) affect.

### cypress

```bash
$ sh cypress-tests.sh # runs everything from scratch, identical to CI

$ cd smoke-tests
$ yarn test:dev # open cypress runner GUI runs them against local dev server (localhost:3000)
$ yarn test:dev --env inspirehep_url=<any url that serves inspirehep ui>
```

#### visual tests

Visual tests are run only on `headless` mode. So `yarn test:dev` which uses the headed browser will ignore them.
Running existing visual tests and updating/creating snapshots requires `run-cypress-tests.sh` script.

For continous runs (when local DB is running and has required records etc.), the script can be reduced to only the last part `sh cypress-tests-run.sh`

### e2e

```bash
$ ./run-e2e.sh
```

---

## How to import records

First make sure that you are running:

```bash
$ cd backend
$ ./scripts/server
```

There is a command `inspirehep importer records` which accepts url `-u`, a directory of `JSON` files `-d` and `JSON` files `-f`.
A selection of demo records can be found in `data` directory and they are structure based on the record type (i.e. `literature`). Examples:

#### With url

```bash
# Local
$ poetry run inspirehep importer records -u https://labs.inspirehep.net/api/literature/20 -u https://labs.inspirehep.net/api/literature/1726642
# Docker
$ .docker-compose run --rm web poetry run inspirehep importer records -u https://labs.inspirehep.net/api/literature/20 -u https://labs.inspirehep.net/api/literature/1726642

# `--save` will save the imported record also to the data folder
$ <...> inspirehep importer records -u https://labs.inspirehep.net/api/literature/20 --save
```

Valid `--token` or `backend/inspirehep/config.py:AUTHENTICATION_TOKEN` is required.

#### With directory

```bash
# Local
$ poetry run inspirehep importer records -d data/records/literature
# Docker
$ .docker-compose run --rm web poetry run inspirehep importer records -d data/records/literature
```

#### With files

```bash
# Local
$ poetry run inspirehep importer records -f data/records/literature/374836.json -f data/records/authors/999108.json
# Docker
$ docker-compose run --rm web poetry run inspirehep importer records -f data/records/literature/374836.json -f data/records/authors/999108.json
```
