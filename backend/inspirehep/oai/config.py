#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

OAISERVER_ID_PREFIX = "oai:inspirehep.net:"
OAISERVER_RECORD_INDEX = "records-hep"
OAISERVER_QUERY_PARSER_FIELDS = {}
OAISERVER_REGISTER_RECORD_SIGNALS = False

OAISERVER_METADATA_FORMATS = {
    "marcxml": {
        "serializer": "inspirehep.oai.serializers:record_json_to_marcxml",
        "schema": "http://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd",
        "namespace": "http://www.loc.gov/MARC21/slim",
    },
    "oai_openaire": {
        "serializer": "inspirehep.oai.serializers:record_json_to_oairexml",
        "schema": "https://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd",
        "namespace": "http://namespace.openaire.eu/schema/oaire/",
    },
}

OAI_SET_CDS = "ForCDS"
OAI_SET_CERN_ARXIV = "CERN:arXiv"
OAI_SET_OAIRE = "Literature"
