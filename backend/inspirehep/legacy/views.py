# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, abort, current_app, redirect, request

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.utils import get_pid_for_pid

blueprint = Blueprint("inspirehep_legacy", __name__, url_prefix="")


@blueprint.route("/record/<path:record_path>", methods=("GET",))
def redirect_record(record_path):
    recid = record_path.split("/")[0]
    endpoint = PidStoreBase.get_endpoint_for_recid(recid)
    if not endpoint:
        abort(404)

    return redirect(f"/{endpoint}/{recid}", 301)


@blueprint.route("/author/profile/<path:bai>", methods=("GET",))
def redirect_author(bai):
    recid = get_pid_for_pid("bai", bai, "recid")
    if not recid:
        abort(404)

    return redirect(f"/authors/{recid}", 301)


@blueprint.route("/search", methods=("GET",))
def redirect_query():
    # TODO: Delete redirection to legacy when Institutions and Experiments are
    # on labs and legacy UI is completely shut down
    collection_equivalence = {
        "HEP": "literature",
        "HepNames": "authors",
        "Conferences": "conferences",
        "Jobs": "jobs",
    }

    legacy_collection = request.args.get("cc", "HEP")
    query = request.args.get("p")

    collection = collection_equivalence.get(legacy_collection)
    if collection:
        return redirect(f"/{collection}?q={query}", 301)
    else:
        return redirect(
            f"{current_app.config['LEGACY_BASE_URL']}/search?{request.query_string.decode('utf-8')}",
            302,
        )
