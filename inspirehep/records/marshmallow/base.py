# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from copy import copy

from inspire_dojson.utils import get_recid_from_ref, strip_empty_values
from marshmallow import post_dump
from marshmallow.schema import Schema


class InspireBaseSchema(Schema):
    _post_dumps = []

    @post_dump(pass_original=True)
    def process_post_dump_in_order(self, object, original_data):
        for dump_func in self._post_dumps:
            object = dump_func(object, original_data)
        return strip_empty_values(object)


class InspireIncludeAllFieldsSchemaMixin(object):
    """Ugly way to easily dump whole records without specifying every field manually"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._post_dumps.append(self.include_original_fields)

    def include_original_fields(self, object, original_data):
        for key, value in original_data.items():
            if key not in object and key not in self.exclude:
                object[key] = original_data[key]
        return object


class PopulateRecidMixin(object):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._post_dumps.append(self.populate_recid_from_ref)

    def populate_recid_from_ref(self, record, *args, **kwargs):
        """Extract recids from all JSON reference fields and add them to ES.

        For every field that has as a value a JSON reference, adds a sibling
        after extracting the record identifier. Siblings are named by removing
        ``record`` occurrences and appending ``_recid`` without doubling or
        prepending underscores to the original name.

        Example::

            {'record': {'$ref': 'http://x/y/2}}

        is transformed to::

            {
                'recid': 2,
                'record': {'$ref': 'http://x/y/2},
            }

        For every list of object references adds a new list with the
        corresponding recids, whose name is similarly computed.

        Example::

            {
                'records': [
                    {'$ref': 'http://x/y/1'},
                    {'$ref': 'http://x/y/2'},
                ],
            }

        is transformed to::

            {
                'recids': [1, 2],
                'records': [
                    {'$ref': 'http://x/y/1'},
                    {'$ref': 'http://x/y/2'},
                ],
            }

        """
        list_ref_fields_translations = {"deleted_records": "deleted_recids"}

        def _recursive_find_refs(json_root):
            if isinstance(json_root, list):
                items = enumerate(json_root)
            elif isinstance(json_root, dict):
                items = copy(json_root).items()
            else:
                items = []
            for key, value in items:
                if (
                    isinstance(json_root, dict)
                    and isinstance(value, dict)
                    and "$ref" in value
                ):
                    # Append '_recid' and remove 'record' from the key name.
                    key_basename = key.replace("record", "").rstrip("_")
                    new_key = "{}_recid".format(key_basename).lstrip("_")
                    json_root[new_key] = get_recid_from_ref(value)
                elif (
                    isinstance(json_root, dict)
                    and isinstance(value, list)
                    and key in list_ref_fields_translations
                ):
                    new_list = [get_recid_from_ref(v) for v in value]
                    new_key = list_ref_fields_translations[key]
                    json_root[new_key] = new_list
                else:
                    json_root[key] = _recursive_find_refs(value)
            return json_root

        return _recursive_find_refs(record)


class InspireAllFieldsWithRecidSchema(
    InspireBaseSchema, InspireIncludeAllFieldsSchemaMixin, PopulateRecidMixin
):
    def __init__(self, *args, **kwargs):
        InspireBaseSchema.__init__(self, *args, **kwargs)
        InspireIncludeAllFieldsSchemaMixin.__init__(self, *args, **kwargs)
        PopulateRecidMixin.__init__(self, *args, **kwargs)
