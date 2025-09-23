#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from inspire_dojson.api import record2marcxml_etree
from inspirehep.oai.converter import OpenAIREXMLConverter

LOGGER = structlog.getLogger()


def record_json_to_marcxml(pid, record, **kwargs):
    """Converts record to marcxml for OAI."""
    return record2marcxml_etree(record["_source"])


def record_json_to_oairexml(pid, record, **kwargs):
    """Converts record to oairexml for OAI."""
    builder = OpenAIREXMLConverter()
    try:
        return builder.get_xml(record["_source"])
    except Exception as e:
        LOGGER.exception(
            "Error during conversion of record to OAI-XML format.",
            pid=pid,
            error=str(e),
        )
        pass
