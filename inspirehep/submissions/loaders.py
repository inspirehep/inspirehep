# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Submissions Loaders"""

from invenio_records_rest.loaders.marshmallow import (
    json_patch_loader,
    marshmallow_loader,
)
from .marshmallow import Literature


literature_v1 = marshmallow_loader(Literature)
