# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.assign.views import update_author_bai


def test_author_bai_is_updated_correctly_in_ids_list():
    lit_author_data = {
        "affiliations": [
            {
                "record": {"$ref": "'https://inspirebeta.net/api/institutions/903317'"},
                "value": "Utrecht U.",
            }
        ],
        "curated_relation": True,
        "emails": ["g.thooft@uu.nl"],
        "full_name": "'t Hooft, Gerard",
        "ids": [{"schema": "INSPIRE BAI", "value": "G.tHooft.1"}],
        "raw_affiliations": [
            {
                "value": "Institute for Theoretical Physics, Utrecht University Postbox, 80.089, 3508 TB Utrecht, Salerno, the Netherlands, Italy"
            }
        ],
        "record": {"$ref": ["Filtered"]},
        "signature_block": "HAFTg",
        "uuid": "45cef7a9-f35a-4d18-a6bc-a689aed7a685",
    }

    to_author_bai = "G.tHooft.2"
    new_ids_list = update_author_bai(to_author_bai, lit_author_data)
    assert new_ids_list == [{"schema": "INSPIRE BAI", "value": to_author_bai}]
