# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os
from abc import ABC, abstractmethod

from inspirehep.records.api import InspireRecord
from inspirehep.search.api import IQ, LiteratureSearch
from inspirehep.utils import chunker
from invenio_db import db
from structlog import get_logger


class SearchCheckDo(ABC):
    """Find and modify programmatically a number of records based on some criteria.

    This is an abstract base class that needs to be subclassed to provide the
    concrete implementations of the different steps to perform.

    The following data need to be provided:
    * ``query``: The search query string to select the records to operate on.
    * ``check``: A method accepting an ``InspireRecord`` instance (or rather, a
    collection-specific subclass of it) and returning True iff that record
    needs to be modified. It must also accept a ``logger`` kwarg that can be
    used to perform additional (structured) logging, and a ``state`` kwarg,
    which is a dict that can be used to preserve some (expensive or annoying to
    compute) state for the ``do`` step of the current record.
    * ``do``: A method accepting a record (satisfying the check) and mutating
    it in place. It must also accept a ``logger`` kwarg that can be used to
    perform additional (structured) logging, and a ``state`` kwarg which is a
    dict containing state preserved by the ``check`` step of the current record.

    By default, the search will be done for Literature records. If a different
    search is required, ``search_class`` needs to be set to a different search
    class (see ``inspirehep.search.api``).

    In order to speed things up, this can be run in parallel as an IndexedJob
    on kubernetes. In addition to the automatically created
    ``JOB_COMPLETION_INDEX`` environment variable, the ``JOB_COMPLETIONS`` env
    var needs to be set to ``.spec.completions``. Work will then be automatically
    distributed between the different pods of the job.

    Instantiating the class will run it.
    """

    search_class = LiteratureSearch
    query = None
    size = 100
    commit_after_each_batch = True

    def __init__(self):
        self.logger = get_logger().bind(class_name=type(self).__name__)
        self.run()

    def search(self):
        if self.query is None:
            return NotImplementedError("`query` needs to be set to a search query")

        self.logger.info("Searching records", query=self.query)
        search_instance = self.search_class()
        # For literature, `query_from_iq` does unwanted permission checks,
        # so we work around it
        query = (
            search_instance.query(IQ(self.query, search_instance))
            if isinstance(search_instance, LiteratureSearch)
            else search_instance.query_from_iq(self.query)
        )
        query = query.params(_source={}, size=self.size, scroll="60m")
        if shard_filter := self._current_shard_filter():
            query = query.filter("script", script=shard_filter)
        return query.scan()

    def _current_shard_filter(self):
        job_index = os.environ.get("JOB_COMPLETION_INDEX")
        if not job_index:
            return None
        total_jobs = os.environ["JOB_COMPLETIONS"]
        self.logger.info(
            "Running as an IndexedJob, sharding records by recid.",
            job_index=job_index,
            total_jobs=total_jobs,
        )
        return f"return doc['control_number'].value % {total_jobs} == {job_index};"

    @abstractmethod
    def check(self, record, logger, state):
        """Check whether the record should be acted upon.

        Warning:
            This needs to be provided and perform a real check even if the
            query has been made precise for consistency reasons (ES and DB
            might be out of sync).

        Args:
            record (InspireRecord): the record to check
            logger (BoundLogger): structlog logger which can be used to perform
                additional logging
            state (dict): a dict that can be written to in order to persist
                information for the ``do`` step of the current record

        Returns:
            bool: True if the record needs to be modified, False otherwise
        """
        pass

    @abstractmethod
    def do(self, record, logger, state):
        """Modify the record metadata.

        Args:
            record (InspireRecord): the record to check
            logger (BoundLogger): structlog logger which can be used to perform
                additional logging
            state (dict): a dict containing information persisted from
                the ``check`` step of the current record
        """
        pass

    def run(self):
        """Make changes to the records that need them."""
        checked_count, modified_count = 0, 0
        self.logger.info("Starting search, check & do job", reason=self.__doc__)
        for chunk in chunker(self.search(), self.size):
            uuids = [r.meta.id for r in chunk]
            self.logger.info("Received record IDs from ES", num_records=len(uuids))
            records = InspireRecord.get_records(uuids)
            self.logger.info(
                "Fetched chunk of records from DB", num_records=len(records)
            )

            for record in records:
                state = {}
                logger = self.logger.bind(recid=record["control_number"])
                checked_count += 1
                record = InspireRecord.get_class_for_record(record)(
                    record, model=record.model
                )
                if not self.check(record, logger=logger, state=state):
                    logger.info("Not modifying record, check negative")
                    continue
                modified_count += 1
                logger.info("Modifying record, check positive")
                self.do(record, logger=logger, state=state)
                record.update(dict(record))

            if self.commit_after_each_batch:
                db.session.commit()

        db.session.commit()
        self.logger.info(
            "Search, check & do job finished successfully.",
            num_records_checked=checked_count,
            num_records_modified=modified_count,
        )
