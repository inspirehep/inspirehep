# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.api import record2marcxml
from lxml import etree as ET


def record_json_to_marcxml(pid, record, **kwargs):
    """Converts record to marcxml for OAI."""
    return ET.fromstring(record2marcxml(record["_source"]))
