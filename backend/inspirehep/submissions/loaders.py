# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Submissions Loaders"""

from flask import request
from invenio_records_rest.loaders.marshmallow import MarshmallowErrors

from inspirehep.submissions.errors import RESTDataError

from .marshmallow import Job


def inspire_submission_marshmallow_loader(schema_class):
    """Marshmallow loader for JSON requests."""

    def json_loader():
        request_json = request.get_json().get("data")

        context = {}
        pid_data = request.view_args.get("pid_value")
        if pid_data:
            pid, _ = pid_data.data
            context["pid"] = pid

        try:
            result = schema_class(context=context).load(request_json)
        except ValueError as e:
            raise RESTDataError(e.args)

        # To return nice message when builder.validation() will fail
        if result.errors:
            raise MarshmallowErrors(result.errors)
        return result.data

    return json_loader


job_v1 = inspire_submission_marshmallow_loader(Job)
