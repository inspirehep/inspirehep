# Inspirehep

### Installation

#### pyenv (optional)

install `pyenv` https://github.com/pyenv/pyenv

```bash
$ pip install pipenv
```

### How to run

```bash
$ ./scripts/bootstrap
$ docker-compose up -d
$ docker-compose run --rm web ./scripts/setup
```

### How to test

```bash
$ docker-compose up -d
$ ./run-tests.sh
```
