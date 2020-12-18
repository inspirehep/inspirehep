# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from inspirehep.records.api.base import InspireRecord


def get_reference_letters_without_email(data):
    reference_letters = data.get("reference_letters", {})
    if "emails" in reference_letters:
        del reference_letters["emails"]
    return reference_letters


def get_addresses_from_linked_institutions(data):
    institutions = InspireRecord.get_linked_records_from_dict_field(
        data, "institutions.record"
    )
    return institutions
