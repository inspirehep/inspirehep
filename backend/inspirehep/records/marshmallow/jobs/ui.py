# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspire_utils.record import get_value
from marshmallow import fields

from inspirehep.accounts.api import (
    get_current_user_orcid,
    is_superuser_or_cataloger_logged_in,
)
from inspirehep.records.marshmallow.jobs.base import JobsPublicSchema
from inspirehep.submissions.utils import has_30_days_passed_after_deadline


class JobsBaseSchema(JobsPublicSchema):
    can_edit = fields.Method("is_job_editable", dump_only=True)

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

        submitter_orcid = get_value(data, "acquisition_source.orcid")
        if submitter_orcid != get_current_user_orcid():
            return False

        status = get_value(data, "status")
        if status != "closed":
            return True

        deadline = get_value(data, "deadline_date")
        if status == "closed" and not has_30_days_passed_after_deadline(deadline):
            return True
        return False


class JobsDetailSchema(JobsBaseSchema):
    pass


class JobsListSchema(JobsBaseSchema):
    pass
