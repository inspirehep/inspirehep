# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from werkzeug.local import LocalProxy

from .api import Countries

countries = Countries()

countries_name_to_code_dict = LocalProxy(lambda: countries.name_to_code)
countries_code_to_name_dict = LocalProxy(lambda: countries.code_to_name)
