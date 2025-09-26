FROM registry.cern.ch/cern-sis/base-images/apache/airflow:3.0.6-python3.11

USER root
RUN apt-get update -y && apt-get install -y imagemagick ghostscript poppler-utils file
RUN sed -i 's/domain="coder" rights="none"/domain="coder" rights="read\|write"/' /etc/ImageMagick-6/policy.xml

USER airflow

WORKDIR /opt/airflow

COPY --chown=airflow:root dags ./dags/
COPY --chown=airflow:root plugins ./plugins/
COPY --chown=airflow:root requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt
