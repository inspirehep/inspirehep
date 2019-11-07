# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in


class CatalogerCanEditMixin:
    def __init__(self, *args, **kwargs):
        super().__init__()
        self.post_dumps.append(self.set_can_edit)

    @staticmethod
    def set_can_edit(data, orginal_data):
        if is_superuser_or_cataloger_logged_in():
            data["can_edit"] = True
        return data
