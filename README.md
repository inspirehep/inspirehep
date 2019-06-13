# Inspirehep

### Installation

#### poetry (optional)

install `poetry` https://poetry.eustace.io/docs/

```bash
$ curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python - --version 0.12.16
```

### How to run

These commands allow you to spin up a contenarized environment that reproduces the Inspire-HEP and Inspire-Next applications.

```bash
$ ./scripts/bootstrap
$ ./docker-inspire up -d
$ ./docker-inspire run --rm web ./scripts/setup
$ firefox localhost:8081
```

#### Without Docker (Only inspirehep Without The UI)

```bash
$ ./scripts/bootstrap
$ ./docker-inspire up -d
$ ./scripts/setup
$ ./scripts/server
$ firefox localhost:5000
```

#### Without Docker Only The UI

```bash
$ cd ui/
$ yarn start
$ firefox localhost:3000
```

You can proxy a server by changing the `ui/package.json`

```json
{
  ...
  "proxy": "http://A_PROXY_SERVER",
  ...
}
```

### Import records

There is a command `inspirehep importer records` which accepts url `-u`, a directory of `JSON` files `-d` and `JSON` files `-f`.
A selection of demo records can be found in `data` directory and they are structure based on the record type (i.e. `literature`). Examples:

#### With url

```bash
# Local
$ inspirehep importer records -u https://labs.inspirehep.net/api/literature/20 -u https://labs.inspirehep.net/api/literature/1726642
# Docker
$ ./docker-inspire run --rm web poetry run inspirehep importer records -u https://labs.inspirehep.net/api/literature/20 -u https://labs.inspirehep.net/api/literature/1726642
```

#### With directory

```bash
# Local
$ inspirehep importer records -d data/literature
# Docker
$ ./docker-inspire run --rm web poetry run inspirehep importer records -d data/literature
```

#### With files

```bash
# Local
$ inspirehep importer records -f data/literature/374836.json -f data/authors/999108.json
# Docker
$ ./docker-inspire run --rm web poetry run inspirehep importer records -f data/literature/374836.json -f data/authors/999108.json
```

### How to test

#### python (unit and integration suites)

```bash
$ ./docker-inspire up -d
$ ./run-tests.sh
```

#### js (unit and ui-tests)

```bash
yarn # if you haven't install the dependencies
yarn test # in ui folder
```

#### e2e

```bash
./run-e2e.sh
```

#### Run Code Checks

Run `isort` and `flake8` checks.

```bash
$ ./run-code-checks.sh
```

### How to login

For developement, we are using local login for our service.

#### UI

For the UI you can login http://localhost:8081/user/login/local

#### Backend

If you want to test inspirehep and backend API you should login http://localhost:5000/login/?next=/&local=1

### How to release

```bash
$ poetry version patch
$ cd ui; npm version patch; cd ..
$ git commit add .
$ git commit -m 'release: vX.X.X'
$ git tag -a 'vX.X.X' -m 'vX.X.X'
$ git push upstream master
```
