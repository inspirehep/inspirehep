# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from invenio_records_rest.serializers.json import JSONSerializer


class ConditionalMultiSchemaJSONSerializer(JSONSerializer):
    def __init__(self, condition_schema_pairs, **kwargs):
        """Initialize record."""
        self.condition_schema_pairs = condition_schema_pairs
        super(ConditionalMultiSchemaJSONSerializer, self).__init__(**kwargs)

    def dump(self, obj, context=None):
        """Serialize object with schema."""
        schema = next(
            schema
            for condition, schema in self.condition_schema_pairs
            if condition(obj)
        )
        return schema(context=context).dump(obj).data
