# INSPIRE HEP

This is a monorepo that currently contains 3 main services (besides helper services)
- Inspirehep - this is what the main inspire services, it serves the website inspirehep.net / inspirebeta.net and calls the required services
- Backoffice - a Django app with the goal of fully replacing [inspire-next](https://github.com/inspirehep/inspire-next/) one day with the help of the workflows service
- Workflows - an airflow service responsible for running the workflows.

Okay now the question is how do we develop on it?


## Running with docker
By far easiest way to get the project running in your machine is through docker (instruction on how to run it locally below for the brave ones), given that you have enough memory

### Make
Make will spin up the required services, depending on what you are working on.

Make sure to have `jq` installed locally
```bash
brew install jq
```

- This will prepare the whole inspire development with demo records:
```bash
make run
```
- This spinup the whole inspirehep development with demo records but without the backoffice
```bash
make run-inspirehep
```
- This will spin up a backoffice
```bash
make run-backoffice
```
- You can stop it by simply run
```bash
make stop
```

### Usage
Upon spinning it up services should be available in the following routes:
- Inspirehep - http://localhost:8080
- Backoffice - http://localhost:8001
- Airflow / Workflows - http://localhost:8070
- Opensearch - http://localhost:9200
- Postgres db  - http://localhost:5432

### How to Log in

- If you simply wish to login to [inspirehep](http://localhost:8080/user/login/local), use `admin@inspirehep.net:123456`
- If you wish to login into [inspirehep/backoffice](http://localhost:8080/backoffice/login/local) or the [actual backoffice](http://localhost:8001/accounts/login/) use `admin@admin.com:admin`
But if you want to test with orcid you will need to set the `ORCID_CLIENT_ID` and `ORCID_CLIENT_SECRET` extra steps must be done:
If you wish to test orcid on `inspirehep`:
   - Go to `backend/inspirehep/orcid/config.py` - They will correspond to `consumer_key` and `consumer_secret`
If you wish to test orcid on `backoffice`:
   - Go to `backoffice/.envs/local/.django` - Add `ORCID_CLIENT_ID` and `ORCID_CLIENT_SECRET` there.
 
  You can find this values in the password manager for the sandbox orcid environment.
 
  **⚠️ Do not forget to remove them before committing ⚠️**

### How to generate a token locally

To generate a token locally, so as to call authenticated endpoints for testing, you can run the following command inside the hep-web container

```bash
inspirehep tokens create -n wow -u admin@inspirehep.net
```

### Testing  (WORK IN PROGRESS)
If you wish to run the tests for a given services here's the way to do it
First exect into the container i.e.: `docker exec -it <container_name> /bin/bash` or via dockerdestkop
Then depending on the service you are testing:
- backoffice-webserver : `pytest .`
- airflow-webserver: `pytest .`
- inspire-hep: ?
- backend: ?

### Adding global variables:
There are two ways of setting environment variables on hep:
- `backend/inspirehep/config.py` 
- `docker-compose.services.yml` - `INVENIO_` prefix must be added. Variables here overwrite `config.py`

## Running Locally
For running the enviroment locally you have the following prerequirements:

### Pre requirements

#### Debian / Ubuntu

```bash
$ sudo apt-get install python3 build-essential python3-dev
```

#### MacOS

```bash
$ brew install postgresql@14 libmagic openssl@3 openblas python
```

### nodejs & npm using nvm

Please follow the instructions https://github.com/nvm-sh/nvm#installing-and-updating

We're using `v20.0.0` (first version we install is the default)

```
$ nvm install 20.0.0
$ nvm use global 20.0.0
```

### yarn

#### Debian / Ubuntu

Please follow the instructions https://classic.yarnpkg.com/en/docs/install/#debian-stable

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

#### The topology of docker-compose

![Alt text](./docker/topology.png)

Follow the guide https://docs.docker.com/compose/install/

### For MacOS users

#### General

Turn of the `AirPlay Receiver` under System Preference -> Sharing -> AirPlay Receiver.
Otherwise, you will run into problems with port 5000 being already in use.
See [this](https://developer.apple.com/forums/thread/682332) for more information.

#### M1 users

Install `Homebrew-file` https://homebrew-file.readthedocs.io/en/latest/installation.html

```bash
$ brew install rcmdnk/file/brew-file
```

And run

```bash
$ brew file install
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

Also setup your **VS Code** so as to use Prettier as the default formatter.

Press `CMD+,` and type `defaultFormatter`. 

From the list choose `Prettier - Code formatter`.

Reload your **VS Code** so as the changes to take effect.

For formatting a file, you can do `CMD+Shift+P` and choose the `Format document` option. This will automatically format your file.

### Editor

```bash
$ cd record-editor
$ yarn install
```

---

### Setup

First you need to start all the services (postgreSQL, Redis, ElasticSearch, RabbitMQ)

```bash
$ docker compose -f docker-compose.services.yml up es mq db cache
```

And initialize database, ES, rabbitMQ, redis and s3

```bash
$ cd backend
$ ./scripts/setup
```

Note that s3 configuration requires default region to be set to `us-east-1`. If you have another default setup in your AWS config (`~/.aws/config`) you need to update it!

Also, to enable fulltext indexing & highlighting the following feature flags must be set to true:

```
FEATURE_FLAG_ENABLE_FULLTEXT = True
FEATURE_FLAG_ENABLE_FILES = True
```

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

In case you wanna use docker and just run the record-editor locally, use the following steps:
1. Add the following volume mount to the record-editor service in the [docker-compose.yml](docker-compose.yml):
    * `- ./record-editor/dist/:/usr/share/nginx/html`
2. Navigate into the record-editor folder and first run `yarn` and then `yarn start`
3. Open a second terminal and run `make run`

The record editor should now be availabe and automatically update when changes are made to the codebase.


#### General
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

#### SNow integration tests

If you wish to modify the SNow integration tests, you have to set the following variables in the SNow [config](https://github.com/inspirehep/inspirehep/blob/master/backend/inspirehep/snow/config.py)
file:

```
 SNOW_CLIENT_ID
 SNOW_CLIENT_SECRET
 SNOW_AUTH_URL
```

The secrets can be found in the inspirehep QA or PROD sealed secrets.
After setting the variables, run the tests, so the cassettes get generated.

**Before you push dont forget to delete the secrets from the config file!**

### UI

```bash
$ cd ui
$ yarn test # runs everything (lint, bundlesize etc.) indentical to CI
$ yarn test:unit # will open jest on watch mode
```

Note that `jest` automatically run tests that changed files (unstaged) affect.

### cypress (e2e)

Runs everything from scratch and saves the output into `cypress.log` file.

**⚠️ Be careful, this will recreate all InspireHEP docker containers ⚠️**

```bash
$ make run-e2e-test
```

Opens cypress runner GUI runs them against local dev server (localhost:8080)

```bash
$ cd e2e
$ yarn test:dev
$ yarn test:dev --env inspirehep_url=<any url that serves inspirehep ui>
```

If you just want to start the e2e tests without running all services just use:
`docker compose run --rm cypress cypress run --browser firefox --headless --env inspirehep_url=http://host.docker.internal:8080`

You may not always need to run tests exactly like on the CI environment.

- To run specific suite, just add `--spec cypress/e2e/<spec.test.js>` to the docker compose run command. E.g `docker compose run --rm cypress cypress run --browser firefox --headless --env inspirehep_url=http://host.docker.internal:8080 --spec cypress/e2e/jobs.test.js`

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
$ poetry run inspirehep importer records -u https://inspirehep.net/api/literature/20 -u https://inspirehep.net/api/literature/1726642
# Docker
$ docker compose exec hep-web inspirehep importer records -u https://inspirehep.net/api/literature/20 -u https://inspirehep.net/api/literature/1726642

# `--save` will save the imported record also to the data folder
$ <...> inspirehep importer records -u https://inspirehep.net/api/literature/20 --save
```

Valid `--token` or `backend/inspirehep/config.py:AUTHENTICATION_TOKEN` is required.

#### With directory

```bash
# Local
$ poetry run inspirehep importer records -d data/records/literature
# Docker
$ docker compose exec hep-web inspirehep importer records -d data/records/literature
```

#### With files

```bash
# Local
$ poetry run inspirehep importer records -f data/records/literature/374836.json -f data/records/authors/999108.json
# Docker
$ docker compose exec hep-web inspirehep importer records -f data/records/literature/374836.json -f data/records/authors/999108.json
```

#### All records

```bash
# Local
$ poetry run inspirehep importer demo-records
# Docker
$ docker compose exec hep-web inspirehep importer demo-records
```

#### Bumping airflow
Follow the instructions [linked here](https://confluence.cern.ch/display/RCSSIS/Update+Airflow+Base+Image+%28with+classifier+model%29+for+INSPIRE)
to update the base image version of airflow (e.g. 3.0.3 -> 3.0.5).
After changing the base image versions change the following files:
- workflows/Dockerfile.local - update the airflow base version (e.g. 1.0.0 -> 1.0.1)
- workflows/Dockerfile - update the airflow version (e.g. 1.0.0 -> 1.0.1)
- requirements.txt - update the airflow version (e.g. 3.0.3 -> 3.0.5) and the constraints
