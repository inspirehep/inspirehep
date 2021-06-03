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
$ nvm use global 10.14.0
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

### Docker & Docker Compose

Follow the guide https://docs.docker.com/compose/install/


---

## Run with docker

### Step 1: In a terminal run
```bash
$ docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

### Step 2: On another browser run

```bash
docker-compose -f docker-compose.yml -f ./e2e/docker-compose.cypress.yml exec web ./scripts/setup
docker-compose -f docker-compose.yml -f ./e2e/docker-compose.cypress.yml exec next-web inspirehep db create
```

### Step 3: Import records

```bash
$ docker-compose -f docker-compose.yml -f ./e2e/docker-compose.cypress.yml exec web inspirehep importer records -f data/records/authors/1010819.json -f data/records/conferences/1769332.json -f data/records/conferences/1794610.json -f data/records/conferences/1809034.json -f data/records/conferences/1776122.json -f data/records/conferences/1622944.json -f data/records/seminars/1811573.json -f data/records/seminars/1811750.json -f data/records/seminars/1811657.json -f data/records/seminars/1807692.json -f data/records/seminars/1807690.json -f data/records/jobs/1811684.json -f data/records/jobs/1812904.json -f data/records/jobs/1813119.json -f data/records/jobs/1811836.json -f data/records/jobs/1812529.json -f data/records/authors/1004662.json -f data/records/authors/1060898.json -f data/records/authors/1013725.json -f data/records/authors/1078577.json -f data/records/authors/1064002.json -f data/records/authors/1306569.json -f data/records/conferences/1787117.json -f data/records/literature/1787272.json -f data/records/seminars/1799778.json -f data/records/conferences/1217045.json -f data/records/jobs/1812440.json -f data/records/authors/1274753.json -f data/records/institutions/902858.json -f data/records/experiments/1513946.json -f data/records/literature/1331798.json -f data/records/literature/1325985.json -f data/records/literature/1306493.json -f data/records/literature/1264675.json -f data/records/literature/1263659.json -f data/records/literature/1263207.json -f data/records/literature/1249881.json -f data/records/literature/1235543.json -f data/records/literature/1198168.json -f data/records/literature/1113908.json -f data/records/literature/873915.json -f data/records/literature/1688995.json -f data/records/literature/1290484.json -f data/records/literature/1264013.json -f data/records/literature/1257993.json -f data/records/literature/1310649.json -f data/records/literature/1473056.json -f data/records/literature/1358394.json -f data/records/literature/1374620.json -f data/records/literature/1452707.json -f data/records/literature/1649231.json -f data/records/literature/1297062.json -f data/records/literature/1313615.json -f data/records/literature/1597429.json -f data/records/literature/1184194.json -f data/records/literature/1322719.json -f data/records/literature/1515024.json -f data/records/literature/1510263.json -f data/records/literature/1415120.json -f data/records/literature/1400808.json -f data/records/literature/1420712.json -f data/records/literature/1492108.json -f data/records/literature/1598135.json -f data/records/literature/1306493.json -f data/records/literature/1383683.json -f data/records/literature/1238110.json

```


---

## Run locally

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

### Editor

```bash
$ cd record-editor
$ yarn install
```

---

### Setup

First you need to start all the services (postgreSQL, Redis, ElasticSearch, RabbitMQ)

```bash
$ docker-compose -f docker-compose.services.yml up es mq db cache
```

And initialize database and ES

```bash
$ cd backend
$ ./scripts/setup
```

---

### Run

#### Backend

You can visit Backend http://localhost:8000

```bash
$ cd backend
$ ./scripts/server
```

#### UI

You can visit UI http://localhost:3000

```bash
$ cd ui
$ yarn start
```

#### Editor

```bash
$ cd ui
$ yarn start
```

You can also connect UI to another environment by changing the proxy in `ui/setupProxy.js`

```javascript
proxy({
  target: 'http://A_PROXY_SERVER',
  ...
});
```

---

## How to test

### Backend

The backend tests locally use [`testmon`](https://github.com/tarpas/pytest-testmon) to only run tests that depend on code that has changed (after the first run) by default:

```bash
$ cd backend
$ poetry run ./run-tests.sh
```

If you pass the `--all` flag to the `run-tests.sh` script, all tests will be run (this is equivalent to the `--testmon-noselect` flag). All other flags passed to the script are transferred to `py.test`, so you can do things like

```bash
$ poetry run ./run-tests.sh --pdb -k test_failing
```

You'll need to run all tests or force test selection (e.g. with `-k`) in a few cases:

- an external dependency has changed, and you want to make sure that it doesn't break the tests (as `testmon` doesn't track external deps)
- you manually change a test fixture in a non-python file (as `testmon` only tracks python imports, not external data)

If you want to invoke `py.test` directly but still want to use `testmon`, you'll need to use the `--testmon --no-cov` flags:

```bash
$ poetry run py.test tests/integration/records --testmon --no-cov
```

If you want to disable `testmon` test selection but still perform collection (to update test dependencies), use `--testmon-noselect --no-cov` instead.

Note that `testmon` is only used locally to speed up tests and not in the CI to be completely sure _all_ tests pass before merging a commit.

### UI

```bash
$ cd ui
$ yarn test # runs everything (lint, bundlesize etc.) indentical to CI
$ yarn test:unit # will open jest on watch mode
```

Note that `jest` automatically run tests that changed files (unstaged) affect.

### cypress (e2e)

```bash
$ sh cypress-tests.sh # runs everything from scratch, identical to CI

$ cd e2e
$ yarn test:dev # open cypress runner GUI runs them against local dev server (localhost:3000)
$ yarn test:dev --env inspirehep_url=<any url that serves inspirehep ui>
```

#### visual tests

Visual tests are run only on `headless` mode. So `yarn test:dev` which uses the headed browser will ignore them.
Running existing visual tests and updating/creating snapshots requires `cypress-tests.sh` script.

For continuous runs (when local DB is running and has required records etc.), the script can be reduced to only the last part `sh cypress-tests-run.sh`.

If required, tests can run against `localhost:3000` by simply modifying `--host` option in `sh cypress-tests-run.sh`.

#### working with (visual) tests more efficiently

(TODO: improve DX)

You may not always need to run tests exactly like on the CI environment.

- To run specific suite, just change `test` script in `e2e/package.json` temporarily to `cypress run --spec cypress/integration/<spec.test.js>`
- To enable mounting `backend` code and live update, just use `e2e/docker-compose.cypress.dev.yml` instead.

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
