# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import mock
import pytest

from inspirehep.mailing.errors import SendGridMissingAPIToken
from inspirehep.mailing.providers.sendgrid import send_email


def test_send_email_fails_without_api_key(appctx):
    with mock.patch.dict(appctx.config, {"SENDGRID_API_KEY": None}), pytest.raises(SendGridMissingAPIToken):
        send_email('sender@cern.ch', 'receiver@cern.ch', 'subject', 'test')


@mock.patch('inspirehep.mailing.providers.sendgrid.SendGridAPIClient.send')
def test_send_email_passing_proper_args(mock_send, appctx):

    sender = 'sender@cern.ch'
    receiver = 'receiver@cern.ch'
    body = 'Body message'
    subj = 'Subject text'
    cc = 'cc@cern.ch'

    with mock.patch.dict(appctx.config, {"SENDGRID_API_KEY": 'token'}):
        send_email(sender, receiver, subj, body, cc=[cc])

    mock_send.assert_called()

    mail_object = mock_send.call_args[0][0]
    assert mail_object.subject.subject == subj
    assert mail_object.from_email.email == sender
    assert mail_object.contents[0].content == body
    assert mail_object.personalizations[0].ccs == [{'email': cc}]
    assert mail_object.personalizations[0].tos == [{'email': receiver}]
