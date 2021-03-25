# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from itertools import chain

from inspire_utils.date import earliest_date
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value


def get_literature_earliest_date(data):
    """Returns earliest date.

    Returns:
        str: earliest date represented in a string
    """
    date_paths = [
        "preprint_date",
        "thesis_info.date",
        "thesis_info.defense_date",
        "publication_info.year",
        "imprints.date",
    ]

    dates = [
        str(el)
        for el in chain.from_iterable(
            force_list(get_value(data, path)) for path in date_paths
        )
    ]

    if dates:
        result = earliest_date(dates)
        if result:
            return result

    return None
