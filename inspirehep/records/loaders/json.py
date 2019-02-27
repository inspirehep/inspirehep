# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.loaders.marshmallow import marshmallow_loader

from ..marshmallow.literature import (
    LiteratureAuthorsSchemaV1,
    LiteratureReferencesSchemaV1,
    LiteratureSchemaV1,
    LiteratureESEnhancementV1,
)

literature_json_v1 = marshmallow_loader(LiteratureSchemaV1)
literature_authors_json_v1 = marshmallow_loader(LiteratureAuthorsSchemaV1)
literature_references_json_v1 = marshmallow_loader(LiteratureReferencesSchemaV1)
