FROM registry.cern.ch/cern-sis/base-images/jupyter/scipy-notebook:python-3.8

USER 0

ENV SSL_CERT_FILE="/etc/ssl/certs/ca-certificates.crt" \
    REQUESTS_CA_BUNDLE="/etc/ssl/certs/ca-certificates.crt"

COPY CERN_Root_Certification_Authority_2.pem /usr/local/share/ca-certificates/CERN_Root_Certification_Authority_2.crt

RUN update-ca-certificates \
 && pip config set global.cert "${REQUESTS_CA_BUNDLE}"

RUN apt-get update -y && \ 
    apt-get install -y \
    gcc \
    g++ \
    poppler-utils \
    libmagic1 \
    libpq-dev
COPY hep_requirements.txt jupyter_requirements.txt /etc/jupyter/
WORKDIR /etc/jupyter/

# unfortunately, it is needed because of the python version we use currently
RUN pip install jupyterhub==2.2.1
RUN pip install -U -r hep_requirements.txt

ARG COMMIT_HASH
ENV GH_COMMIT_HASH $COMMIT_HASH
RUN pip install git+https://github.com/inspirehep/inspirehep.git@$GH_COMMIT_HASH#subdirectory=backend
RUN pip install -r jupyter_requirements.txt
ENV JUPYTERHUB_SINGLEUSER_APP="jupyter_server.serverapp.ServerApp"

RUN mkdir /opt/conda/var/
RUN chown jovyan /opt/conda/var/
USER jovyan
