# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import copy
import os
import random
import uuid

import orjson
import pkg_resources
from invenio_records.models import RecordMetadata
from invenio_search import current_search_client as es

from inspirehep.records.api import InspireRecord

from .base import TestBaseModel, generate_random_string
from .invenio_pidstore import TestPersistentIdentifier

USED_RECIDS = {}
MAX_ES_INT = 2147483647
MAX_RANDOMIZE_TRIES = 100


def get_next_free_recid():
    next_recid_candidate = random.randint(1, MAX_ES_INT)
    cur_try = 0
    while next_recid_candidate in USED_RECIDS and cur_try < MAX_RANDOMIZE_TRIES:
        next_recid_candidate = random.randint(1, MAX_ES_INT)
        cur_try += 1

    if cur_try >= MAX_RANDOMIZE_TRIES:
        raise Exception(
            "Unable to find a non-used record id, tried %d times." % cur_try
        )

    reserve_recid(next_recid_candidate)
    return next_recid_candidate


def reserve_recid(recid):
    USED_RECIDS[recid] = True


def cleanup():
    global USED_RECIDS
    USED_RECIDS = {}


class TestRecordMetadata(TestBaseModel):
    """Create Record instance.

    Example:
        >>> from factories.db.invenio_records import TestRecordMetadata
        >>> factory = TestRecordMetadata.create_from_kwargs(json={'name': 'joe'})
        >>> factory.record_metadata
        <RecordMetadata (transient 4661300240)>
        >>> factory.record_metadata.json
        {'name': 'joe', '_collections': ['Literature'], 'control_number': 5, 'titles': [{'title': 'dfjMz4eAgcJS1642UvCGPSieqhnIU6DuasOBHVlHA88tGqwpHOv8Kln63wkZ'}], '$schema': 'http://localhost:5000/schemas/record/hep.json', 'document_type': ['article']}
        >>> type(factory.inspire_record)
        <class 'inspirehep.modules.records.api.InspireRecord'>
    """

    model_class = RecordMetadata

    JSON_SKELETON = {
        "$schema": "http://localhost:5000/schemas/record/hep.json",
        "document_type": ["article"],
        "_collections": ["Literature"],
    }

    @classmethod
    def create_from_kwargs(
        cls, index_name="", disable_persistent_identifier=False, **kwargs
    ):
        instance = cls()

        updated_kwargs = copy.deepcopy(kwargs)
        if not kwargs.pop("id", None):
            updated_kwargs["id"] = uuid.uuid4()

        json_ = copy.deepcopy(cls.JSON_SKELETON)
        json_.update(kwargs.pop("json", {}))

        if kwargs.get("pid_type", "lit") == "lit" and "titles" not in json_:
            json_.update({"titles": [{"title": generate_random_string(60)}]})
        if "control_number" not in json_:
            json_["control_number"] = get_next_free_recid()
        else:
            reserve_recid(json_["control_number"])

        updated_kwargs["json"] = json_

        instance.record_metadata = super(TestRecordMetadata, cls).create_from_kwargs(
            updated_kwargs
        )

        if index_name:
            instance.es_index_result = es.index(
                index=index_name, body=instance.record_metadata.json, params={}
            )
            instance.es_refresh_result = es.indices.refresh(index_name)
        if not disable_persistent_identifier:
            instance.persistent_identifier = TestPersistentIdentifier.create_from_kwargs(
                object_uuid=instance.record_metadata.id,
                pid_value=instance.record_metadata.json.get("control_number"),
                **kwargs
            ).persistent_identifier

        instance.inspire_record = InspireRecord(
            instance.record_metadata.json, model=RecordMetadata
        )

        return instance

    @classmethod
    def create_from_file(cls, module_name, filename, **kwargs):
        """Create Record instance from file.

        Note:
            It will look inside the ``fixtures`` directory for the given module.

        Example:
            >>> from factories.db.invenio_records import TestRecordMetadata
            >>> factory = TestRecordMetadata.create_from_file(__name__, filename)
            >>> factory.record_metadata
            <RecordMetadata (transient 4661300240)>
            >>> factory.record_metadata.json
        """
        path = pkg_resources.resource_filename(
            module_name, os.path.join("fixtures", filename)
        )
        with open(path) as fp:
            data = orjson.loads(fp.read())
        return cls.create_from_kwargs(json=data, **kwargs)
