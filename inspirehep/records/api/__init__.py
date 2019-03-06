# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


from .authors import AuthorsRecord  # noqa: F401
from .base import InspireRecord  # noqa: F401
from .literature import LiteratureRecord  # noqa: F401
from .receivers import index_after_commit  # noqa: F401
