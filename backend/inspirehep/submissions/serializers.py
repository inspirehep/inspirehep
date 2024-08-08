#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Submissions serializers."""

from invenio_records_rest.serializers.json import JSONSerializer

from inspirehep.submissions.marshmallow import (
    Author,
    Conference,
    Experiment,
    Institution,
    Journal,
    Literature,
    Seminar,
)
from inspirehep.submissions.marshmallow.job import Job

literature_v1 = JSONSerializer(Literature)
author_v1 = JSONSerializer(Author)
job_v1 = JSONSerializer(Job)
conference_v1 = JSONSerializer(Conference)
seminar_v1 = JSONSerializer(Seminar)
experiment_v1 = JSONSerializer(Experiment)
institution_v1 = JSONSerializer(Institution)
journal_v1 = JSONSerializer(Journal)
