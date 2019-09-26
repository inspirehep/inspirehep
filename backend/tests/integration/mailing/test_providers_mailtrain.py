# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from datetime import datetime

import pytest
from freezegun import freeze_time
from mock import patch

from inspirehep.mailing.providers.mailtrain import (
    mailtrain_subscribe_user_to_list,
    mailtrain_update_weekly_campaign_content,
)


@pytest.mark.vrc()
def test_mailtrain_subscribe_user_to_list(base_app, db, es_clear, vcr_cassette):
    list_id = "xKU-qcq8U"
    email = "test@email.ch"
    first_name = "Firstname"
    last_name = "Lastname"
    mailtrain_subscribe_user_to_list(list_id, email, first_name, last_name)
    assert vcr_cassette.all_played


@freeze_time(datetime(2019, 9, 17, 6, 0, 0))
def test_set_mailtrain_campaign_in_redis(base_app, db, redis):
    config = {"WEEKLY_JOBS_EMAIL_REDIS_KEY": "MAILTRAIN_KEY"}
    with patch.dict(base_app.config, config):
        html_content = "<html><a>Some HTML content</a> Blah</html>"
        mailtrain_update_weekly_campaign_content(html_content)

        expected_keys = ["timestamp", "title", "html"]
        expected_values = [
            str(datetime(2019, 9, 17, 6, 0, 0).timestamp()),
            "INSPIRE Jobs listing",
            html_content,
        ]

        result = redis.hmget("MAILTRAIN_KEY", expected_keys)
        assert result == expected_values
