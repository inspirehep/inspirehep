# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_record, create_record_factory

from inspirehep.matcher.utils import create_journal_dict


def test_create_journal_dict(inspire_app):
    data = {
        "journal_title": {
            "title": "Journal of Physical Science and Application",
        },
        "short_title": "J.Phys.Sci.Appl.",
        "title_variants": ["PHYS SCI APPL"],
    }
    create_record("jou", data=data)

    data = {
        "journal_title": {"title": "Image and Vision Computing"},
        "short_title": "Image Vision Comput.",
        "title_variants": ["IMAGE VISION COMPUT", "IMAGE VISION - COMPUTING"],
    }
    create_record("jou", data=data)

    expected = {
        "J PHYS SCI APPL": "J.Phys.Sci.Appl.",
        "JOURNAL OF PHYSICAL SCIENCE AND APPLICATION": "J.Phys.Sci.Appl.",
        "PHYS SCI APPL": "J.Phys.Sci.Appl.",
        "IMAGE VISION COMPUT": "Image Vision Comput.",
        "IMAGE AND VISION COMPUTING": "Image Vision Comput.",
        "IMAGE VISION COMPUTING": "Image Vision Comput.",
    }

    result = create_journal_dict()

    assert expected == result
