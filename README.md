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

```bash
$ docker-compose up -d
$ ./run-tests.sh
```
