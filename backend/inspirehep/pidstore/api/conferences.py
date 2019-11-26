# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.pidstore.minters.cnum import CNUMMinter
from inspirehep.pidstore.minters.control_number import ConferencesMinter


class PidStoreConferences(PidStoreBase):

    minters = [ConferencesMinter, CNUMMinter]
