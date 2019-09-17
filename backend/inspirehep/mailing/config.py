# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

MAILCHIMP_API_TOKEN = None
MAILCHIMP_CLIENT_TIMEOUT = 10

MAILCHIMP_JOBS_WEEKLY_REPLICATE_CAMPAIGN_ID = "074c7e5c33"
MAILCHIMP_JOBS_WEEKLY_LIST_ID = "94ac3f1ad8"
"""
The campaigns cannot be reused, hence we're replicating an existing one which
contains all the neccessary details i.e. audience, sender, subject etc.
https://us3.admin.mailchimp.com/campaigns/
"""

MAILTRAIN_URL = "https://lists.labs.inspirehep.net"
MAILTRAIN_API_TOKEN = ""
MAILTRAIN_JOBS_WEEKLY_LIST_ID = ""

JOBS_DEADLINE_PASSED_SENDER_EMAIL = "jobs@inspirehep.net"
"""Email address for notifying expired jobs"""

INVENIO_MAIL_SERVER = "localhost"
"""SMTP server settings for the mail sending"""

WEEKLY_JOBS_EMAIL_REDIS_KEY = "jobs_weekly_email"
WEEKLY_JOBS_EMAIL_TITLE = "Weekly update on new job listings."
