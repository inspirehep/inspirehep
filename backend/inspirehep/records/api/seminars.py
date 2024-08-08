#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.pidstore.api import PidStoreSeminars
from inspirehep.records.api.base import InspireRecord
from inspirehep.records.marshmallow.seminars.es import SeminarsElasticSearchSchema


class SeminarsRecord(InspireRecord):
    """Seminars Record."""

    es_serializer = SeminarsElasticSearchSchema
    pid_type = "sem"
    pidstore_handler = PidStoreSeminars
