# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields, post_dump


class DOISchemaV1(Schema):
    material = fields.Raw()
    value = fields.Raw()

    @post_dump(pass_many=True)
    def filter(self, data, many):
        if many:
            return self.remove_duplicate_doi_values(data)
        return data

    @staticmethod
    def remove_duplicate_doi_values(dois):
        taken_doi_values = set()
        unique_dois = []
        for doi in dois:
            doi_value = doi.get("value")
            if doi_value not in taken_doi_values:
                taken_doi_values.add(doi_value)
                unique_dois.append(doi)
        return unique_dois
