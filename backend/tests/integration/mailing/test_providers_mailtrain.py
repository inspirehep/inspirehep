# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest

from inspirehep.mailing.providers.mailtrain import mailtrain_subscribe_user_to_list


@pytest.mark.vrc()
def test_mailtrain_subscribe_user_to_list(base_app, db, es_clear, vcr_cassette):
    list_id = "xKU-qcq8U"
    email = "test@email.ch"
    first_name = "Firstname"
    last_name = "Lastname"
    mailtrain_subscribe_user_to_list(list_id, email, first_name, last_name)
    assert vcr_cassette.all_played
