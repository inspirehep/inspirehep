# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from .base import ControlNumberMinter


class LiteratureMinter(ControlNumberMinter):
    pid_type = "lit"


class AuthorsMinter(ControlNumberMinter):
    pid_type = "aut"


class JobsMinter(ControlNumberMinter):
    pid_type = "job"


class JournalsMinter(ControlNumberMinter):
    pid_type = "jou"


class ExperimentsMinter(ControlNumberMinter):
    pid_type = "exp"


class ConferencesMinter(ControlNumberMinter):
    pid_type = "con"


class DataMinter(ControlNumberMinter):
    pid_type = "dat"


class InstitutionsMinter(ControlNumberMinter):
    pid_type = "ins"


class SeminarsMinter(ControlNumberMinter):
    pid_type = "sem"
