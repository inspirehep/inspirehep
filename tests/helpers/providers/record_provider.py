# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


import random

import pytest
from faker import Faker
from faker.providers import BaseProvider
from inspire_schemas.api import validate as schema_validate

fake = Faker()


class RecordProvider(BaseProvider):
    def control_number(self):
        return fake.random_number(digits=8, fix_len=True)

    def doi(self):
        return "10.{}/{}".format(
            fake.random_number(digits=4, fix_len=True),
            fake.random_number(digits=8, fix_len=True),
        )

    def arxiv(self):
        return "20{}.{}".format(
            fake.random_number(digits=2, fix_len=True),
            fake.random_number(digits=5, fix_len=True),
        )

    @staticmethod
    def hep_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/hep.json",
            "titles": [{"title": fake.sentence()}],
            "document_type": ["article"],
            "_collections": ["Literature"],
        }

    @staticmethod
    def author_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/authors.json",
            "name": {"value": fake.name()},
            "_collections": ["Authors"],
        }

    @staticmethod
    def add_citations(citation_records=[]):
        data = []
        for record in citation_records:
            data.append(
                {"record": {"$ref": f"http://localhost:5000/api/literature/{record}"}}
            )
        return {"references": data}

    def record(self, record_type, data=None, with_control_number=False, citations=[]):
        if record_type == "lit":
            record = self.hep_record()
        elif record_type == "aut":
            record = self.author_record()

        if with_control_number:
            record["control_number"] = self.control_number()
        if data:
            record.update(data)
        if citations:
            record.update(self.add_citations(citations))
        schema_validate(record)
        return record
