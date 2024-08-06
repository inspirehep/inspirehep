FROM apache/airflow:2.9.3-python3.11

WORKDIR /opt/airflow

COPY --chown=airflow:root dags ./dags/
COPY --chown=airflow:root plugins ./plugins/
COPY --chown=airflow:root requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt
