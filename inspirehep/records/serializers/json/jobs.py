# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify

from inspirehep.records.marshmallow.jobs import JobsRawPublicSchemaV1
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import JSONSerializer

jobs_json_v1 = JSONSerializer(JobsRawPublicSchemaV1, index_name="records-jobs")

jobs_json_v1_response = record_responsify(jobs_json_v1, "application/json")

jobs_json_v1_response_search = search_responsify(jobs_json_v1, "application/json")
