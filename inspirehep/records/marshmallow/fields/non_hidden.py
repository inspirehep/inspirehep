# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields, utils


def filter_hidden(dict_or_list):
    if utils.is_collection(dict_or_list):
        return [item for item in dict_or_list if not item.get("hidden")]

    return dict_or_list if not dict_or_list.get("hidden") else {}


class NonHiddenNested(fields.Nested):
    def _serialize(self, value, attr, obj):
        value = filter_hidden(value)
        return super()._serialize(value, attr, obj)


class NonHiddenRaw(fields.Raw):
    def _serialize(self, value, attr, obj):
        value = filter_hidden(value)
        return super()._serialize(value, attr, obj)
