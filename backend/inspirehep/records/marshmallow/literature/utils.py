# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.api import InspireRecord


def get_parent_record(data):
    if data.get("doc_type") == "inproceedings":
        conference_records = InspireRecord.get_linked_records_from_dict_field(
            data, "publication_info.conference_record"
        )
        conference_record = next(conference_records, {})
        return conference_record

    book_records = InspireRecord.get_linked_records_from_dict_field(
        data, "publication_info.parent_record"
    )
    return next(book_records, {})
