# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Submissions Loaders"""

from flask import request
from invenio_records_rest.loaders.marshmallow import MarshmallowErrors

from inspirehep.submissions.errors import LoaderDataError, RESTDataError

from .marshmallow import Author, Conference, Job, Literature


def inspire_submission_marshmallow_loader(schema_class):
    """Marshmallow loader for JSON requests."""

    def json_loader():
        request_json = request.get_json().get("data")

        context = {}
        pid_data = request.view_args.get("pid_value")
        if pid_data:
            pid = pid_data
            context["pid"] = pid

        try:
            result = schema_class(context=context).load(request_json)
        except ValueError as e:
            raise RESTDataError(e.args)
        except Exception as e:
            raise LoaderDataError() from e

        if result.errors:
            raise MarshmallowErrors(result.errors)
        return result.data

    return json_loader


author_v1 = inspire_submission_marshmallow_loader(Author)
conference_v1 = inspire_submission_marshmallow_loader(Conference)
job_v1 = inspire_submission_marshmallow_loader(Job)
literature_v1 = inspire_submission_marshmallow_loader(Literature)
