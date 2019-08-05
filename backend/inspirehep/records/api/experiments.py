# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.experiments import ExperimentsElasticSearchSchema

from ...pidstore.api import PidStoreExperiments
from .base import InspireRecord


class ExperimentsRecord(InspireRecord):
    """Experiments Record."""

    es_serializer = ExperimentsElasticSearchSchema
    pid_type = "exp"
    pidstore_handler = PidStoreExperiments
