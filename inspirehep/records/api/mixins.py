# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from sqlalchemy import func

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

    @classmethod
    def get_citation_annual_summary(cls, uuids):
        """Builds db query which returns citations count grouped by year for specified uuids
        Args:
            uuids(list): uuids of all records for which citations summary per year will be callculated

        Returns:
            query: db query for provided data.

        """
        db_query = RecordCitations.query.with_entities(
            func.count(RecordCitations.citation_date).label("sum"),
            func.date_trunc("year", RecordCitations.citation_date).label("year"),
        )
        db_query = db_query.filter(RecordCitations.cited_id.in_(uuids))
        db_query = db_query.group_by("year").order_by("year")
        return db_query
