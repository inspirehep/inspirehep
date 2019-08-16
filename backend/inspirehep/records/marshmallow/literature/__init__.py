# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
# flake8: noqa

from .authors import LiteratureAuthorsSchema
from .base import LiteratureAdminSchema, LiteraturePublicSchema
from .es import LiteratureElasticSearchSchema
from .references import LiteratureReferencesSchema
from .ui import LiteratureDetailSchema, LiteratureListWrappedSchema
