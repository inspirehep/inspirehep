# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

# "https://rt.inspirehep.net/REST/1.0/"

from inspirehep.errors import BaseRestError


class SnowAuthenticationError(BaseRestError):
    """Error representing failure on SNOW login"""

    code = 401
    description = "SNOW authentication failed!"


class CreateTicketException(BaseRestError):
    code = 400
    description = "Ticket can't be created!"


class EditTicketException(BaseRestError):
    code = 400
    description = "Ticket can't be edited!"
