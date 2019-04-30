# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.models import RecordCitations


class CitationMixin(object):
    """Implements methods for citations"""

    def _citation_query(self):
        """Prepares query with all records which cited this one

        Returns:
            query: Query containing all citations for this record

        """
        return RecordCitations.query.filter_by(cited_id=self.id)

    @property
    def citation_count(self):
        """Gives citation count number

        Returns:
            int: Citation count number for this record if it is literature or data
            record.
        """
        return self._citation_query().count()
