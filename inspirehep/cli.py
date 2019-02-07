# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from invenio_app.factory import create_api
from invenio_base.app import create_cli

cli = create_cli(create_app=create_api)
