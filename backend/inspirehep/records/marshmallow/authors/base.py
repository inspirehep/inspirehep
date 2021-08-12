# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.record import get_value
from invenio_db import db
from invenio_records.api import RecordMetadata
from marshmallow import Schema, fields

from inspirehep.records.models import StudentsAdvisors

from ..base import RecordBaseSchema
from ..fields import NonHiddenRaw


class AuthorsRawSchema(RecordBaseSchema):
    positions = NonHiddenRaw(dump_only=True)
    advisors = NonHiddenRaw(dump_only=True)
    project_membership = NonHiddenRaw(dump_only=True)

    @staticmethod
    def get_student_name(data):
        preferred_name = get_value(data, "name.preferred_name")
        if not preferred_name:
            preferred_name = get_value(data, "name.value")
        return preferred_name

    def populate_students_field(self, record):
        student_records = (
            db.session.query(RecordMetadata.json, StudentsAdvisors.degree_type)
            .filter(
                StudentsAdvisors.student_id == RecordMetadata.id,
                StudentsAdvisors.advisor_id == record.id,
            )
            .all()
        )
        student_entries = []
        for student_json, student_degree in student_records:
            student_data = {
                "name": self.get_student_name(student_json),
                "record": student_json["self"],
                "degree_type": student_degree,
            }
            student_entries.append(student_data)
        return student_entries


# Fields that are needed to be indexed but exluded from API responses
FIELDS_TO_EXCLUDE = ["author_suggest", "self"]


class AuthorsPublicSchema(AuthorsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE + [
            "_private_notes",
            "_collections",
            "acquisition_source",
        ]

    email_addresses = NonHiddenRaw(dump_only=True)


class AuthorsPublicListSchema(AuthorsRawSchema):
    class Meta:
        exclude = AuthorsPublicSchema.Meta.exclude + ["email_addresses"]

    students = fields.Raw(dump_only=True)


class AuthorsAdminSchema(AuthorsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE

    email_addresses = fields.Raw(dump_only=True)
    positions = fields.Raw(dump_only=True)
    advisors = fields.Raw(dump_only=True)
    project_membership = fields.Raw(dump_only=True)
    students = fields.Raw(dump_only=True)


class AuthorsOnlyControlNumberSchema(Schema):
    control_number = fields.Raw(dump_only=True)
