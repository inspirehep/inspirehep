# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import pre_dump

from .author import AuthorSchemaV1


class SupervisorSchemaV1(AuthorSchemaV1):
    @pre_dump
    def pre_filter(self, data):
        if "inspire_roles" not in data:
            return {}
        elif "supervisor" not in data.get("inspire_roles", ["author"]):
            return {}
        return data
