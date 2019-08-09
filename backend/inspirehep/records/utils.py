# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import chain

import numpy as np
from beard.clustering import block_phonetic
from inspire_utils.date import earliest_date
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value


def get_literature_earliest_date(data):
    """Returns earliest date. If earliest date is missing month or day
    it's set as 1 as DB does not accept date without day or month

    Returns:
        str: earliest date represented in a string
    """
    date_paths = [
        "preprint_date",
        "thesis_info.date",
        "thesis_info.defense_date",
        "publication_info.year",
        "legacy_creation_date",
        "imprints.date",
    ]

    dates = [
        str(el)
        for el in chain.from_iterable(
            force_list(get_value(data, path)) for path in date_paths
        )
    ]

    if dates:
        result = earliest_date(dates, full_date=True)
        if result:
            return result

    return None


def get_authors_phonetic_blocks(full_names, phonetic_algorithm="nysiis"):
    """Create a dictionary of phonetic blocks for a given list of names."""

    # The method requires a list of dictionaries with full_name as keys.
    full_names_formatted = [{"author_name": i} for i in full_names]

    # Create a list of phonetic blocks.
    phonetic_blocks = list(
        block_phonetic(
            np.array(full_names_formatted, dtype=np.object).reshape(-1, 1),
            threshold=0,
            phonetic_algorithm=phonetic_algorithm,
        )
    )

    return dict(zip(full_names, phonetic_blocks))
