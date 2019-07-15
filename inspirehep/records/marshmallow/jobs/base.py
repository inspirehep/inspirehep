# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.record import get_value
from marshmallow import fields

from inspirehep.accounts.api import (
    is_loggedin_user_email,
    is_superuser_or_cataloger_logged_in,
)
from inspirehep.records.marshmallow.base import (
    InspireAllFieldsSchema,
    InspireESEnhancementSchema,
)
from inspirehep.records.marshmallow.literature.common import (
    AcceleratorExperimentSchemaV1,
)


class JobsMetadataRawFieldsSchemaV1(InspireAllFieldsSchema):
    class Meta:
        exclude = ("can_edit",)

    def __init__(self, *args, **kwargs):
        super().__init__()
        self._post_dumps.append(self.set_editable_post_dump)

    accelerator_experiments = fields.Nested(
        AcceleratorExperimentSchemaV1, dump_only=True, many=True
    )

    def set_editable_post_dump(self, object_, original_data):
        if JobsMetadataRawFieldsSchemaV1.is_job_editable(object_):
            object_["can_edit"] = True
        return object_

    @staticmethod
    def is_job_editable(data):
        """Check if the given job is editable

        A job is editable if one of the following is true:
        * current user is superadmin or cataloger
        * the job 'status' is not 'closed' and the job's author is logged-in.

        Args:
            data (dict): the jobs metadata.

        Returns:
            bool: True if the job can be edited, False otherwise.
        """
        if is_superuser_or_cataloger_logged_in():
            return True
        email = get_value(data, "acquisition_source.email")
        return data.get("status") != "closed" and is_loggedin_user_email(email)


class JobsESEnhancementV1(InspireESEnhancementSchema, JobsMetadataRawFieldsSchemaV1):
    pass
