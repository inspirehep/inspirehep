# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from __future__ import absolute_import, print_function

from flask_celeryext import create_celery_app
from invenio_app.factory import create_api

celery = create_celery_app(create_api())
