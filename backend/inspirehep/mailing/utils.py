# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime

import structlog
from dateutil.parser import parse
from humanize import naturaltime

LOGGER = structlog.getLogger()


def humanize_date_to_natural_time(value):
    """Humanize date.

    Args:
        value (str): The date to format.

    Note:
        This function is for jinja filter use.

    Example:
        > {{"2100-01-01" | humanize }}
    """

    try:
        date_now = datetime.datetime.utcnow()
        parsed_date = parse(value, ignoretz=True)
        return naturaltime(date_now - parsed_date)
    except Exception:
        # Report but don't break
        LOGGER.exception("Cannot parse date.", date=value)
        return ""
