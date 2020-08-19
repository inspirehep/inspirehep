# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from flask import current_app
from inspire_utils.record import get_values_for_schema

from inspirehep.pidstore.minters.base import Minter
from inspirehep.pidstore.providers import InspireExternalIdProvider
from inspirehep.pidstore.providers.bai import InspireBAIProvider


class BAIMinter(Minter):
    pid_type = "bai"
    provider = InspireBAIProvider

    def __init__(self, object_uuid, data):
        super().__init__(object_uuid, data)
        if not current_app.config.get("FEATURE_FLAG_ENABLE_BAI_PROVIDER", False):
            self.provider = InspireExternalIdProvider

    @classmethod
    def update(cls, object_uuid, data):
        minter = super().update(object_uuid, data)
        pid_values = minter.get_pid_values()
        if not pid_values and current_app.config.get(
            "FEATURE_FLAG_ENABLE_BAI_PROVIDER", False
        ):
            minter.create()
        return minter

    @classmethod
    def mint(cls, object_uuid, data):
        minter = super().mint(object_uuid, data)
        pid_values = minter.get_pid_values()
        if not pid_values and current_app.config.get(
            "FEATURE_FLAG_ENABLE_BAI_PROVIDER", False
        ):
            minter.create()
        return minter

    def get_pid_values(self):
        return set(get_values_for_schema(self.data.get("ids", []), "INSPIRE BAI"))

    def create(self, pid_value=None, **kwargs):
        bai = super().create(pid_value, data=self.data, **kwargs)
        if current_app.config.get("FEATURE_FLAG_ENABLE_BAI_PROVIDER", False):
            if bai and pid_value is None:
                self.data.setdefault("ids", [])
                self.data["ids"].append(
                    {"schema": "INSPIRE BAI", "value": bai.pid.pid_value}
                )
        return bai
