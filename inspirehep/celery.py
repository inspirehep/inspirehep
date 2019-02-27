# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from flask_celeryext import create_celery_app
from inspirehep.factory import create_app

celery = create_celery_app(create_app(LOGGING_SENTRY_CELERY=True))

