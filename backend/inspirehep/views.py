#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint

blueprint = Blueprint("inspirehep_main", __name__, url_prefix="")


@blueprint.route("/ping")
def ping():
    return "pong"
