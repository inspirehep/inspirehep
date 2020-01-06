# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app


def include_table_check(object, name, type_, *args, **kwargs):
    if type_ == "table" and name in current_app.config.get("ALEMBIC_SKIP_TABLES"):
        return False
    return True


def get_inspirehep_url():
    PROTOCOL = current_app.config["PREFERRED_URL_SCHEME"]
    SERVER = current_app.config["SERVER_NAME"]
    return f"{PROTOCOL}://{SERVER}"
