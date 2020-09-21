# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.errors import BaseRestError


class MaximumSearchPageSizeExceeded(BaseRestError):
    code = 400

    def __init__(self, max_size=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if max_size:
            self.description = (
                f"Maximum search page size of `{max_size}` results exceeded."
            )
        else:
            self.description = f"Maximum search page size exceeded."


class FieldsParamForbidden(BaseRestError):
    code = 400
    description = (
        "'fields' parameter cannot be used with the requested format or MIME type."
    )
