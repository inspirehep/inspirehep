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

    if endpoint == "data":
        return redirect(f"{current_app.config['LEGACY_BASE_URL']}/record/{recid}", 302)

    return redirect(f"/{endpoint}/{recid}", 301)


@blueprint.route("/author/<bai>", methods=("GET",))
def redirect_author(bai):
    return _redirect_author(bai)


@blueprint.route("/author/profile/<bai>", methods=("GET",))
def redirect_author_profile(bai):
    return _redirect_author(bai)


def _redirect_author(bai):
    recid = get_pid_for_pid("bai", bai, "recid")
    if not recid:
        abort(404)

    return redirect(f"/authors/{recid}", 301)


@blueprint.route("/author/claim/<bai>", methods=("GET",))
def redirect_claim(bai):
    if current_app.config["FEATURE_FLAG_ENABLE_LEGACY_VIEW_REDIRECTS"]:
        return redirect(
            f"{current_app.config['LEGACY_BASE_URL']}/author/claim/{bai}", 302
        )

    recid = get_pid_for_pid("bai", bai, "recid")
    return redirect(f"/authors/{recid}", 302)


@blueprint.route("/author/merge_profiles", methods=("GET",))
def redirect_merge_profiles():
    if current_app.config["FEATURE_FLAG_ENABLE_LEGACY_VIEW_REDIRECTS"]:
        return redirect(
            f"{current_app.config['LEGACY_BASE_URL']}/author/merge_profiles?{request.query_string.decode('utf-8')}",
            302,
        )

    return redirect("/authors", 302)


@blueprint.route("/author/manage_profile/<bai>", methods=("GET",))
def redirect_manage_profile(bai):
    if current_app.config["FEATURE_FLAG_ENABLE_LEGACY_VIEW_REDIRECTS"]:
        return redirect(
            f"{current_app.config['LEGACY_BASE_URL']}/author/manage_profile/{bai}", 302
        )
    recid = get_pid_for_pid("bai", bai, "recid")
    return redirect(f"/authors/{recid}", 302)


@blueprint.route("/search", methods=("GET",))
def redirect_query():
    legacy_collection = request.args.get("cc", "HEP")
    query = request.args.get("p", "")

    collection = current_app.config["COLLECTION_EQUIVALENCE"].get(legacy_collection)
    if collection:
        return redirect(f"/{collection}?q={query}", 301)

    if current_app.config["FEATURE_FLAG_ENABLE_LEGACY_VIEW_REDIRECTS"]:
        return redirect(
            f"{current_app.config['LEGACY_BASE_URL']}/search?{request.query_string.decode('utf-8')}",
            302,
        )

    collection = f'_collections:"{legacy_collection}"' if legacy_collection else ""
    query = f" and {query}" if query else ""
    query = f"{collection}{query}"
    return redirect(f"/literature?q={query}", 301)


@blueprint.route("/collection/<legacy_collection>", methods=("GET",))
def redirect_collection(legacy_collection):
    collection = current_app.config["COLLECTION_EQUIVALENCE"].get(legacy_collection)
    if collection:
        return redirect(f"/{collection}", 301)

    if current_app.config["FEATURE_FLAG_ENABLE_LEGACY_VIEW_REDIRECTS"]:
        return redirect(
            f"{current_app.config['LEGACY_BASE_URL']}/collection/{legacy_collection}",
            302,
        )
    query = f'_collections:"{legacy_collection}"'
    return redirect(f"/literature?q={query}", 301)


@blueprint.route("/info/<path:info_path>", methods=("GET",))
def redirect_info(info_path):
    return redirect(f"{current_app.config['LEGACY_BASE_URL']}/info/{info_path}", 302)


@blueprint.route("/legacy/arxiv/<path:arxiv>", methods=("GET",))
def redirect_to_lit_record_by_arxiv(arxiv):
    recid = get_pid_for_pid("arxiv", arxiv, "recid")
    return redirect(f"/literature/{recid}")


@blueprint.route("/legacy/orcid/<orcid>", methods=("GET",))
def redirect_tp_aut_record_by_orcid(orcid):
    recid = get_pid_for_pid("orcid", orcid, "recid")
    return redirect(f"/authors/{recid}")
