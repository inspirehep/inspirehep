#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

CREATE TABLE IF NOT EXISTS workflow_approval (
  id text NOT NULL,
  approval text NOT NULL
);

EOSQL
