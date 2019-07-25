# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.jobs import JobsElasticSearchSchema

from ...pidstore.api import PidStoreJobs
from .base import InspireRecord


class JobsRecord(InspireRecord):
    """Jobs Record."""

    es_serializer = JobsElasticSearchSchema
    pid_type = "job"
    pidstore_handler = PidStoreJobs
