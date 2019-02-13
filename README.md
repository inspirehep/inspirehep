[![Coverage Status](https://coveralls.io/repos/github/inspirehep/inspirehep/badge.svg?branch=master)](https://coveralls.io/github/inspirehep/inspirehep?branch=master)

# Inspirehep

### Installation

#### pyenv (optional)
install ``pyenv`` https://github.com/pyenv/pyenv

```bash
$ pip install pipenv
```

### How to run

```bash
$ ./scripts/bootstrap
$ ./scripts/server
$ docker-compose up -d
$ ./scripts/setup
```

### How to test

```bash
$ docker-compose up -d
$ ./run-tests.sh
```
