# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.institutions import InstitutionsElasticSearchSchema

from ...pidstore.api import PidStoreInstitutions
from .base import InspireRecord


class InstitutionsRecord(InspireRecord):
    """Institutions Record."""

    es_serializer = InstitutionsElasticSearchSchema
    pid_type = "ins"
    pidstore_handler = PidStoreInstitutions
