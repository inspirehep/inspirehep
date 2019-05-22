# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
import hashlib
import io

import flask
from flask import current_app as app
from redis import StrictRedis
from time_execution import time_execution

from .converter import OrcidConverter

CACHE_PREFIX = None


class OrcidCache(object):
    def __init__(self, orcid, recid):
        """
        Orcid cached data.

        Args:
            orcid (string): orcid identifier.
        """
        self.orcid = orcid
        self.recid = recid
        self._cached_hash_value = None
        self._new_hash_value = None

    @property
    def redis(self):
        redis = getattr(flask.g, "redis_client", None)
        if redis is None:
            url = app.config.get("CACHE_REDIS_URL")
            redis = StrictRedis.from_url(url, decode_responses=True)
            flask.g.redis_client = redis
        return redis

    @property
    def _key(self):
        """Return the string '`CACHE_PREFIX`:orcidcache:`orcid_value`:`recid`'"""
        prefix = ""
        if CACHE_PREFIX:
            prefix = "{}:".format(CACHE_PREFIX)
        return "{}orcidcache:{}:{}".format(prefix, self.orcid, self.recid)

    @time_execution
    def write_work_putcode(self, putcode, inspire_record=None):
        """
        Write the putcode and the hash for the given (orcid, recid).

        Args:
            putcode (string): the putcode used to push the record to ORCID.
            inspire_record (InspireRecord): InspireRecord instance. If provided,
             the hash for the record content is re-computed.

        Raises:
            ValueError: when the putcode is empty.
        """
        if not putcode:
            raise ValueError("Empty putcode not allowed")

        data = {"putcode": putcode}

        if inspire_record:
            if not self._new_hash_value:
                self._new_hash_value = _OrcidHasher(inspire_record).compute_hash()
            data["hash"] = self._new_hash_value

        self.redis.hmset(self._key, data)

    @time_execution
    def read_work_putcode(self):
        """Read the putcode for the given (orcid, recid)."""
        value = self.redis.hgetall(self._key)
        self._cached_hash_value = value.get("hash")
        return value.get("putcode")

    @time_execution
    def delete_work_putcode(self):
        """Delete the putcode for the given (orcid, recid)."""
        return self.redis.delete(self._key)

    @time_execution
    def has_work_content_changed(self, inspire_record):
        """
        True if the work content has changed compared to the cached version.

        Args:
            inspire_record (InspireRecord): InspireRecord instance. If provided,
             the hash for the record content is re-computed.
        """
        if not self._cached_hash_value:
            self.read_work_putcode()
        if not self._new_hash_value:
            self._new_hash_value = _OrcidHasher(inspire_record).compute_hash()
        return self._cached_hash_value != self._new_hash_value


class _OrcidHasher(object):
    def __init__(self, inspire_record):
        self.inspire_record = inspire_record

    def compute_hash(self):
        """Generate hash for an ORCID-serialised HEP record.

        Return:
            string: hash of the record
        """
        orcid_record = OrcidConverter(
            self.inspire_record, app.config["LEGACY_RECORD_URL_PATTERN"]
        )
        xml = orcid_record.get_xml()  # lxml.etree._Element
        return self._hash_xml_element(xml)

    @classmethod
    def _hash_xml_element(cls, element):
        """Compute a hash for XML element comparison.

        Args:
            element (lxml.etree._Element): the XML node.

        Return:
            string: hash
        """
        canonical_string = cls._canonicalize_xml_element(element)
        hash_value = hashlib.sha1(canonical_string)
        return "sha1:" + hash_value.hexdigest()

    @staticmethod
    def _canonicalize_xml_element(element):
        """Return a string with a canonical representation of the element.

        Args:
            element (lxml.etree._Element): the XML node

        Return:
            string: canonical representation
        """
        element_tree = element.getroottree()
        output_stream = io.BytesIO()
        element_tree.write_c14n(output_stream, with_comments=False, exclusive=True)
        return output_stream.getvalue()
