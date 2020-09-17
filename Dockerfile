FROM inspirehep/poetry:1.0.0b1
WORKDIR /opt/disambiguation

CMD [ "run", "inspire-disambiguation", "cluster" ]

COPY . .

RUN poetry install --no-root --no-dev
RUN poetry install --no-dev
