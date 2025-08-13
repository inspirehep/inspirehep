#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Submissions serializers."""

from inspirehep.submissions.marshmallow.author import (
    Author,
)
from inspirehep.submissions.marshmallow.conferences import (
    Conference,
)
from inspirehep.submissions.marshmallow.experiments import (
    Experiment,
)
from inspirehep.submissions.marshmallow.institutions import (
    Institution,
)
from inspirehep.submissions.marshmallow.job import Job
from inspirehep.submissions.marshmallow.journals import (
    Journal,
)
from inspirehep.submissions.marshmallow.literature import (
    Literature,
)
from inspirehep.submissions.marshmallow.seminars import (
    Seminar,
)
from invenio_records_rest.serializers.json import JSONSerializer

literature_v1 = JSONSerializer(Literature)
author_v1 = JSONSerializer(Author)
job_v1 = JSONSerializer(Job)
conference_v1 = JSONSerializer(Conference)
seminar_v1 = JSONSerializer(Seminar)
experiment_v1 = JSONSerializer(Experiment)
institution_v1 = JSONSerializer(Institution)
journal_v1 = JSONSerializer(Journal)
