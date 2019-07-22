# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from flask import Flask

from inspirehep.logger import InspireLogger


def test_ext():
    """Test extension initialization."""
    app = Flask("testapp")
    InspireLogger(app)

    assert "inspirehep-logger" in app.extensions
