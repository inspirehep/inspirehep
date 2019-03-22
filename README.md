# Inspirehep

### Installation

#### pyenv (optional)

install `pyenv` https://github.com/pyenv/pyenv

```bash
$ pip install pipenv
```

### How to run

These commands allow you to spin up a contenarized environment that reproduces the Inspire-HEP and Inspire-Next applications.

```bash
$ ./scripts/bootstrap
$ ./docker-inspire up -d
$ ./docker-inspire run --rm web ./scripts/setup
$ ./docker-inspire run --rm web-next scripts/setup_inspire_next
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
