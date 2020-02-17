# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import structlog
from invenio_db import db

from inspirehep.records.api import InspireRecord, LiteratureRecord

LOGGER = structlog.getLogger()


def update_records_relations(uuids):
    """Task which updates records_citations and conference_literature tables with
    relation to proper literature records.

    Args:
        uuids: records uuids for which relations should be reprocessed
    Returns:
        set: set of properly processed records uuids
    """
    for uuid in uuids:
        try:
            with db.session.begin_nested():
                record = InspireRecord.get_record(uuid)
                if isinstance(record, LiteratureRecord):
                    record.update_refs_in_citation_table()
                    record.update_conference_paper_and_proccedings()
        except Exception:
            LOGGER.exception("Cannot recalculate relations", uuid=str(uuid))

    db.session.commit()
    return uuids
