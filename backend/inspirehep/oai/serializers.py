#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.api import record2marcxml_etree
from inspirehep.oai.builder import OpenAIREXMLBuilder


def record_json_to_marcxml(pid, record, **kwargs):
    """Converts record to marcxml for OAI."""
    return record2marcxml_etree(record["_source"])


def record_json_to_oairexml(pid, record, **kwargs):
    """Converts record to oairexml for OAI."""
    builder = OpenAIREXMLBuilder()
    return builder.get_xml(record["_source"])
