FROM python:3.11.6-slim-bullseye as python

ARG APP_HOME=/app
WORKDIR ${APP_HOME}

ARG BUILD_ENVIRONMENT=local
ENV BUILD_ENV ${BUILD_ENVIRONMENT}

ENV PATH="/root/.local/bin:${PATH}" \
    POETRY_VIRTUALENVS_CREATE=false \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install --no-install-recommends -y \
  curl libpq-dev build-essential gettext \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

ARG POETRY_VERSION
ENV POETRY_VERSION="${POETRY_VERSION:-1.6.1}"
RUN curl -sSL https://install.python-poetry.org \
  | python - --version "${POETRY_VERSION}" \
  && poetry --version

COPY poetry.lock ./poetry.lock
COPY pyproject.toml ./pyproject.toml
RUN poetry install --no-root

COPY . ${APP_HOME}
RUN poetry install
