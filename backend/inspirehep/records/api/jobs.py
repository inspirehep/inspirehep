# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from elasticsearch_dsl import Q

from inspirehep.pidstore.api import PidStoreJobs
from inspirehep.records.api.base import InspireRecord
from inspirehep.records.marshmallow.jobs import JobsElasticSearchSchema
from inspirehep.search.api import JobsSearch


class JobsRecord(InspireRecord):
    """Jobs Record."""

    es_serializer = JobsElasticSearchSchema
    pid_type = "job"
    pidstore_handler = PidStoreJobs

    @staticmethod
    def get_jobs_by_deadline(date):
        """Return a list of all open jobs whose deadlines match the given date.

        Args:
            date (datetime): date object.

        Return:
            list: list of open jobs matching a deadline.

        """
        query = (
            Q("match", **{'deadline_date': date.isoformat()})
            & Q("match", **{'status': 'open'})
        )
        results = JobsSearch().query(query).execute().hits
        return results
