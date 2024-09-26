#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app
from werkzeug.local import LocalProxy

current_s3_instance = LocalProxy(
    lambda: current_app.extensions["inspirehep-s3"].s3_instance
)
