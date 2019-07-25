# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
# flake8: noqa

from .base import (
    AuthorsAdminSchema,
    AuthorsOnlyControlNumberSchema,
    AuthorsPublicSchema,
)
from .es import AuthorsElasticSearchSchema
from .ui import AuthorsDetailSchema, AuthorsListSchema
