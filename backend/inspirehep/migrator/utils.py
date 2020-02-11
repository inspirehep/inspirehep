# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Migrator utils."""

import signal
from itertools import chain

import structlog
from dojson.contrib.marc21.utils import create_record
from flask import current_app, url_for
from inspire_utils.helpers import force_list
from redis import StrictRedis

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


def cache_afs_file_locations(record):
    """Cache the local location of the files on AFS."""
    redis = StrictRedis.from_url(current_app.config["CACHE_REDIS_URL"])
    afs_prefix = (
        current_app.config.get("LABS_AFS_HTTP_SERVICE")
        or "file:///afs/cern.ch/project/inspire/PROD"
    )
    documents_and_figures = chain(
        record.get("documents", []), record.get("figures", [])
    )
    mapping = {
        doc["original_url"]: doc["url"]
        for doc in documents_and_figures
        if doc.get("original_url", "").startswith(afs_prefix)
    }
    if mapping:
        redis.hmset("afs_file_locations", mapping)


def replace_afs_file_locations_with_local(record):
    """Replace AFS file location with locally cached copy if possible.

    Returns:
        list: the original AFS URLs that were replaced by local ones.
    """
    redis = StrictRedis.from_url(current_app.config["CACHE_REDIS_URL"])
    afs_prefix = (
        current_app.config.get("LABS_AFS_HTTP_SERVICE")
        or "file:///afs/cern.ch/project/inspire/PROD"
    )
    documents_and_figures = chain(
        record.get("documents", []), record.get("figures", [])
    )
    original_urls = []

    for doc in documents_and_figures:
        if not doc["url"].startswith(afs_prefix):
            continue
        new_url = redis.hget("afs_file_locations", doc["url"])
        if new_url:
            original_urls.append(doc["url"])
            doc["url"] = new_url.decode()

    return original_urls


def remove_cached_afs_file_locations(original_urls):
    redis = StrictRedis.from_url(current_app.config["CACHE_REDIS_URL"])
    if not original_urls:
        return None
    return redis.hdel("afs_file_locations", *original_urls)


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
