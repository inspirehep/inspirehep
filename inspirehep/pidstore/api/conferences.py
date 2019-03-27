# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from ..minters.control_number import ConferencesMinter
from .base import PidStoreBase


class PidStoreConferences(PidStoreBase):

    minters = [ConferencesMinter]
