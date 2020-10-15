# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify

from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.records.marshmallow.jobs import JobsPublicListSchema, JobsPublicSchema
from inspirehep.records.marshmallow.jobs.ui import JobsDetailSchema, JobsListSchema
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import JSONSerializer

jobs_json = JSONSerializer(
    wrap_schema_class_with_metadata(JobsPublicSchema), index_name="records-jobs"
)

jobs_json_search = JSONSerializer(
    wrap_schema_class_with_metadata(JobsPublicListSchema), index_name="records-jobs"
)


jobs_json_response = record_responsify(jobs_json, "application/json")

jobs_json_response_search = search_responsify(jobs_json_search, "application/json")

jobs_json_detail = JSONSerializer(wrap_schema_class_with_metadata(JobsDetailSchema))
jobs_json_detail_response = record_responsify(
    jobs_json_detail, "application/vnd+inspire.record.ui+json"
)
jobs_json_list = JSONSerializer(
    wrap_schema_class_with_metadata(JobsListSchema), index_name="records-jobs"
)
jobs_json_list_response = search_responsify(
    jobs_json_list, "application/vnd+inspire.record.ui+json"
)
