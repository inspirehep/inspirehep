# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime


def has_30_days_passed_after_deadline(deadline):
    deadline_date = datetime.datetime.strptime(deadline, "%Y-%m-%d").date()
    days_after_deadline = (datetime.date.today() - deadline_date).days
    return days_after_deadline >= 30
