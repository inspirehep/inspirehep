FROM registry.cern.ch/cern-sis/inspire/airflow-base:3.4.0 AS base

USER root
RUN apt-get update -y && apt-get install -y ghostscript poppler-utils file

USER airflow

WORKDIR /opt/airflow

COPY --chown=airflow:root dags ./dags/
COPY --chown=airflow:root plugins ./plugins/
COPY --chown=airflow:root constraints.txt ./constraints.txt
COPY --chown=airflow:root requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

FROM base AS test

COPY --chown=airflow:root requirements-test.txt ./requirements-test.txt
RUN pip install --no-cache-dir -r requirements-test.txt

FROM base AS production
