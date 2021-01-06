# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Submissions serializers."""

from invenio_records_rest.serializers.json import JSONSerializer

from inspirehep.submissions.marshmallow.job import Job

from .marshmallow import Author, Conference, Literature, Seminar

literature_v1 = JSONSerializer(Literature)
author_v1 = JSONSerializer(Author)
job_v1 = JSONSerializer(Job)
conference_v1 = JSONSerializer(Conference)
seminar_v1 = JSONSerializer(Seminar)
