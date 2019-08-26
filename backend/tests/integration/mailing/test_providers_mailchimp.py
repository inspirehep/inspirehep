# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import mock
import pytest

from inspirehep.mailing.errors import MailChimpMissingAPIToken
from inspirehep.mailing.providers.mailchimp import mailchimp_get_client


def test_mailchimp_client(appctx, db, es_clear):
    with mock.patch.dict(appctx.config, {"MAILCHIMP_API_TOKEN": None}):
        with pytest.raises(MailChimpMissingAPIToken):
            mailchimp_get_client()
