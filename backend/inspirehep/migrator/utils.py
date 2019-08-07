# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Migrator utils."""

import signal

import structlog
from dojson.contrib.marc21.utils import create_record
from flask import url_for
from inspire_utils.helpers import force_list

LOGGER = structlog.getLogger()


REAL_COLLECTIONS = (
    "INSTITUTION",
    "EXPERIMENT",
    "JOURNALS",
    "JOURNALSNEW",
    "HEPNAMES",
    "HEP",
    "JOB",
    "JOBHIDDEN",
    "CONFERENCES",
    "DATA",
)


def get_collection(marc_record):
    collections = set()
    for field in force_list(marc_record.get("980__")):
        for v in field.values():
            for e in force_list(v):
                collections.add(e.upper().strip())
    if "DELETED" in collections:
        return "DELETED"
    for collection in collections:
        if collection in REAL_COLLECTIONS:
            return collection
    return "HEP"


def get_collection_from_marcxml(marcxml):
    marc_record = create_record(marcxml, keep_singletons=False)
    return get_collection(marc_record)


def ensure_valid_schema(record):
    """Make sure the ``$schema`` key of the record is valid.
    This is done by setting the correct url to the schema, in case it only
    contains the schema filename.
    """
    if not record["$schema"].startswith("http"):
        schema = record["$schema"]
        record["$schema"] = url_for(
            "invenio_jsonschemas.get_schema",
            schema_path=f"records/{schema}",
            _external=True,
        )


class GracefulKiller:
    """Class used for handling SIGTERM and SIGINT signals.
    Inspired by: https://stackoverflow.com/questions/18499497/how-to-process-sigterm-signal-gracefully/31464349#31464349.
    """

    def __init__(self):
        signal.signal(signal.SIGINT, self.exit_gracefully)
        signal.signal(signal.SIGTERM, self.exit_gracefully)
        self._kill_now = False

    def exit_gracefully(self, signum, frame):
        LOGGER.info("Termination signal received, terminating...")
        self._kill_now = True

    def kill_now(self):
        # For testability purpose, this is preferred to self._kill_now
        return self._kill_now
