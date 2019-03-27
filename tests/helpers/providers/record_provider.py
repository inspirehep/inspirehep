# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


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

    def orcid(self):
        return "0000-{}-{}-{}".format(
            fake.random_number(digits=4, fix_len=True),
            fake.random_number(digits=4, fix_len=True),
            fake.random_number(digits=4, fix_len=True),
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
    def job_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/jobs.json",
            "_collections": ["Jobs"],
        }

    @staticmethod
    def journal_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/journals.json",
            "_collections": ["Journals"],
            "short_title": fake.sentence(),
            "journal_title": {"title": fake.sentence()},
        }

    @staticmethod
    def experiment_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/experiments.json",
            "_collections": ["Experiments"],
            "project_type": ["experiment"],
        }

    @staticmethod
    def conference_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/conferences.json",
            "_collections": ["Conferences"],
        }

    @staticmethod
    def data_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/data.json",
            "_collections": ["Data"],
        }

    @staticmethod
    def add_citations(citation_records):
        data = []
        for record in citation_records:
            data.append(
                {"record": {"$ref": f"http://localhost:5000/api/literature/{record}"}}
            )
        return {"references": data}

    def record(
        self,
        record_type,
        data=None,
        with_control_number=False,
        citations=[],
        skip_validation=False,
    ):
        if record_type == "lit":
            record = self.hep_record()
        elif record_type == "aut":
            record = self.author_record()
        elif record_type == "job":
            record = self.job_record()
        elif record_type == "jou":
            record = self.journal_record()
        elif record_type == "exp":
            record = self.experiment_record()
        elif record_type == "con":
            record = self.conference_record()
        elif record_type == "dat":
            record = self.data_record()

        if with_control_number:
            record["control_number"] = self.control_number()
        if data:
            record.update(data)
        if citations:
            record.update(self.add_citations(citations))
        if not skip_validation:
            schema_validate(record)
        return record
