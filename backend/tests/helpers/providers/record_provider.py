# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

import random
import re

import pytz
from faker import Faker
from faker.providers import BaseProvider
from inspire_schemas.api import validate as schema_validate

fake = Faker()


class RecordProvider(BaseProvider):
    @staticmethod
    def control_number():
        return fake.random_number(digits=8, fix_len=True)

    @staticmethod
    def doi():
        return "10.{}/{}".format(
            fake.random_number(digits=4, fix_len=True),
            fake.random_number(digits=8, fix_len=True),
        )

    @staticmethod
    def arxiv():
        return "20{}.{}".format(
            fake.random_number(digits=2, fix_len=True),
            fake.random_number(digits=5, fix_len=True),
        )

    @staticmethod
    def orcid():
        """Orcid has to be 15000000 >= orcid <= 35000000"""
        orcid_integer = str(random.randint(15_000_000, 35_000_000))
        orcid_id = (
            f"0000-000{orcid_integer[0]}-{orcid_integer[1:5]}-{orcid_integer[5:]}"
        )

        val = str(orcid_id).replace("-", "").replace(" ", "").upper()
        r = 0
        for x in val:
            r = (r + int(x)) * 2
        ck = (12 - r % 11) % 11
        if ck == 10:
            ck = "X"

        orcid_id += str(ck)
        return orcid_id

    @staticmethod
    def bai():
        return f"{re.sub('[ .]+', '.', fake.name())}.{fake.random_number(digits=1)}"

    @staticmethod
    def hep_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/hep.json",
            "titles": [{"title": fake.sentence()}],
            "document_type": ["article"],
            "_collections": ["Literature"],
        }

    @classmethod
    def author_record(cls):
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
            "description": fake.sentence(),
            "deadline_date": fake.date(pattern="%Y-%m-%d", end_datetime=None),
            "position": "staff",
            "regions": ["Europe"],
            "status": random.choice(["open", "closed", "pending"]),
        }

    @staticmethod
    def seminars_record():
        end_datetime = fake.date_time(tzinfo=pytz.utc)
        return {
            "$schema": "http://localhost:5000/schemas/records/seminars.json",
            "_collections": ["Seminars"],
            "end_datetime": end_datetime.isoformat(),
            "start_datetime": fake.date_time(
                tzinfo=pytz.utc, end_datetime=end_datetime
            ).isoformat(),
            "inspire_categories": [
                {
                    "term": random.choice(
                        ["Accelerators", "Experiment-HEP", "Theory-HEP"]
                    )
                }
            ],
            "speakers": [{"name": fake.name()}],
            "timezone": fake.timezone(),
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
    def institutions_record():
        return {
            "$schema": "http://localhost:5000/schemas/records/institutions.json",
            "_collections": ["Institutions"],
        }

    @staticmethod
    def add_citations(citation_records):
        data = []
        for record in citation_records:
            data.append(
                {"record": {"$ref": f"http://localhost:5000/api/literature/{record}"}}
            )
        return {"references": data}

    @staticmethod
    def add_data_citations(citation_records):
        data = []
        for record in citation_records:
            data.append(
                {"record": {"$ref": f"http://localhost:5000/api/data/{record}"}}
            )
        return {"references": data}

    @classmethod
    def add_other_pids(cls, pids):
        if not pids:
            return
        ids = []
        for pid in pids:
            if pid == "orcid":
                ids.append({"schema": "ORCID", "value": cls.orcid()})
            if pid == "bai":
                ids.append({"schema": "INSPIRE BAI", "value": cls.bai()})
        return ids

    @classmethod
    def generate_special_pids(cls, key, pid_generator, count):
        if isinstance(count, bool):
            count = 1
        if not isinstance(count, int) or count <= 0:
            return {}
        data = {key: []}
        for i in range(count):
            data[key].append({"value": pid_generator()})
        return data

    @classmethod
    def add_arxiv_eprints(cls, arxiv_eprints):
        """Create radnom arxiv eprints which means that arxiv ids will be added to pidstore"""
        return cls.generate_special_pids("arxiv_eprints", cls.arxiv, arxiv_eprints)

    @classmethod
    def add_dois(cls, dois):
        return cls.generate_special_pids("dois", cls.doi, dois)

    def record(
        self,
        record_type,
        data=None,
        with_control_number=False,
        literature_citations=[],  # TODO: call `literature_references`
        data_citations=[],
        skip_validation=False,
        other_pids=[],
        arxiv_eprints=None,
        dois=None,
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
        elif record_type == "ins":
            record = self.institutions_record()
        elif record_type == "sem":
            record = self.seminars_record()
        if with_control_number:
            record["control_number"] = self.control_number()
        if data:
            record.update(data)
        if literature_citations:
            record.update(self.add_citations(literature_citations))
        if data_citations:
            record.update(self.add_data_citations(data_citations))
        if arxiv_eprints:
            record.update(self.add_arxiv_eprints(arxiv_eprints))
        if dois:
            record.update(self.add_dois(dois))
        if other_pids:
            ids = record.get("ids", [])
            ids.extend(self.add_other_pids(other_pids))
            record["ids"] = ids
        if not skip_validation:
            schema_validate(record)
        return record
