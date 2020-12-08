# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import orjson
from elasticsearch import SerializationError
from elasticsearch.compat import string_types
from elasticsearch.serializer import JSONSerializer
from flask import current_app

from inspirehep.search.utils import RecursionLimit


class ORJSONSerializerES(JSONSerializer):
    def dumps(self, data):
        if isinstance(data, string_types):
            return data
        try:
            with RecursionLimit(
                current_app.config.get("SEARCH_MAX_RECURSION_LIMIT", 5000)
            ):
                dump = orjson.dumps(data, default=self.default).decode("utf-8")
            return dump
        except (ValueError, TypeError) as ex:
            if isinstance(ex, TypeError) and ex.args == ("Recursion limit reached",):
                # As currently we can only turn off recursion limit but we don't want that as
                # then we should handle overflow error in rust
                return super().dumps(data)
            raise SerializationError(data, ex)

    def loads(self, s):
        try:
            return orjson.loads(s)
        except (ValueError, TypeError) as ex:
            raise SerializationError(s, ex)
