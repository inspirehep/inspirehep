# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.loaders.marshmallow import marshmallow_loader

from ..marshmallow.literature import LiteratureSchemaV1

literature_json_v1 = marshmallow_loader(LiteratureSchemaV1)
