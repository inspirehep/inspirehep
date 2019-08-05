# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.factories.models.base import BaseFactory

from inspirehep.migrator.models import LegacyRecordsMirror


class LegacyRecordsMirrorFactory(BaseFactory):
    class Meta:
        model = LegacyRecordsMirror
