FROM registry.cern.ch/cern-sis/base-images/apache/airflow:3.0.3-python3.11

WORKDIR /opt/airflow

COPY --chown=airflow:root dags ./dags/
COPY --chown=airflow:root plugins ./plugins/
COPY --chown=airflow:root requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

RUN pip uninstall fastapi-cloud-cli -y
RUN pip install sentry-sdk==1.19.1
