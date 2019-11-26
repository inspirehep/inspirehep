# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Submissions serializers."""

from inspire_utils.record import get_values_for_schema
from invenio_records_rest.serializers.json import JSONSerializer

from inspirehep.accounts.api import get_current_user_orcid
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer
from inspirehep.submissions.marshmallow.job import Job

from .marshmallow import Author, Conference, Literature, SameAuthor


def does_current_user_own_author_record(author):
    author_orcids = get_values_for_schema(author.get("ids", []), "ORCID")
    if author_orcids:
        author_orcid = author_orcids.pop()
        return get_current_user_orcid() == author_orcid
    return False


literature_v1 = JSONSerializer(Literature)
author_v1 = ConditionalMultiSchemaJSONSerializer(
    [(does_current_user_own_author_record, SameAuthor), (None, Author)]
)
job_v1 = JSONSerializer(Job)
conference_v1 = JSONSerializer(Conference)
