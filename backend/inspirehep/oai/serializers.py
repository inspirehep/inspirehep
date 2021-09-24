# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.api import record2marcxml_etree


def record_json_to_marcxml(pid, record, **kwargs):
    """Converts record to marcxml for OAI."""
    return record2marcxml_etree(record["_source"])
