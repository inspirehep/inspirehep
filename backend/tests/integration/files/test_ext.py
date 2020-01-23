# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from flask import Flask

from inspirehep.files import InspireS3


def test_ext():
    """Test extension initialization."""
    app = Flask("testapp")
    InspireS3(app)

    assert "inspirehep-s3" in app.extensions
