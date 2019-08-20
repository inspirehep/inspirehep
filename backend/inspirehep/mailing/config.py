# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

MAILCHIMP_API_TOKEN = None
MAILCHIMP_CLIENT_TIMEOUT = 10

MAILCHIMP_JOBS_WEEKLY_REPLICATE_CAMPAIGN_ID = "074c7e5c33"
"""
The campaigns cannot be reused, hence we're replicating an existing one which
contains all the neccessary details i.e. audience, sender, subject etc.
https://us3.admin.mailchimp.com/campaigns/
"""
