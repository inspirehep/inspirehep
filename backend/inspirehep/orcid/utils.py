# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""ORCID utils."""


from itertools import chain

import structlog
from elasticsearch_dsl import Q
from flask import current_app
from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.record import get_value, get_values_for_schema
from invenio_accounts.models import User
from invenio_db import db
from invenio_oauthclient.models import RemoteAccount, RemoteToken, UserIdentity
from invenio_oauthclient.utils import oauth_link_external_id
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from sqlalchemy import cast, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from inspirehep.mailing.api.authors import send_orcid_push_disabled_email
from inspirehep.orcid.push_access_tokens import delete_access_token
from inspirehep.pidstore.models import InspireRedirect
from inspirehep.records.api import AuthorsRecord
from inspirehep.search.api import LiteratureSearch

LOGGER = structlog.getLogger()


def _split_lists(sequence, chunk_size):
    """Get a list created by splitting the original list every n-th element

    Args:
        sequence (List[Any]): a list to be split
        chunk_size (int): how bit one chunk should be (n)

    Returns:
        List[List[Any]]: the split list
    """
    return [
        sequence[i : i + chunk_size]  # noqa:E203
        for i in range(0, len(sequence), chunk_size)
    ]


def get_push_access_tokens(orcids):
    """Get the remote tokens for the given ORCIDs.

    Args:
        orcids(List[str]): ORCIDs to get the tokens for.

    Returns:
        sqlalchemy.util._collections.result: pairs of (ORCID, access_token),
        for ORCIDs having a token. These are similar to named tuples, in that
        the values can be retrieved by index or by attribute, respectively
        ``id`` and ``access_token``.

    """
    return (
        db.session.query(UserIdentity.id, RemoteToken.access_token)
        .filter(
            RemoteToken.id_remote_account == RemoteAccount.id,
            RemoteAccount.user_id == UserIdentity.id_user,
            UserIdentity.id.in_(orcids),
            cast(RemoteAccount.extra_data, JSONB).contains({"allow_push": True}),
        )
        .all()
    )


def account_setup(remote, token, resp):
    """Perform additional setup after user have been logged in.

    This is a modified version of
    :ref:`invenio_oauthclient.contrib.orcid.account_setup` that stores
    additional metadata.

    :param remote: The remote application.
    :param token: The token value.
    :param resp: The response.
    """
    with db.session.begin_nested():
        # Retrieve ORCID from response.
        orcid = resp.get("orcid")
        full_name = resp.get("name")

        # Set ORCID in extra_data.
        token.remote_account.extra_data = {
            "orcid": orcid,
            "full_name": full_name,
            "allow_push": current_app.config.get("ORCID_ALLOW_PUSH_DEFAULT", False),
        }

        user = token.remote_account.user

        # Create user <-> external id link.
        oauth_link_external_id(user, {"id": orcid, "method": "orcid"})


def get_orcids_for_push(record):
    """Obtain the ORCIDs associated to the list of authors in the Literature record.

    The ORCIDs are looked up both in the ``ids`` of the ``authors`` and in the
    Author records that have claimed the paper.

    Args:
        record(dict): metadata from a Literature record

    Returns:
        Iterator[str]: all ORCIDs associated to these authors
    """
    orcids_on_record = []
    author_recids_with_claims = []
    for author in record.get("authors", []):
        orcids_in_author = get_values_for_schema(author.get("ids", []), "ORCID")
        if orcids_in_author:
            orcids_on_record.extend(orcids_in_author)
        if author.get("curated_relation") is True and "record" in author:
            author_recids_with_claims.append(get_recid_from_ref(author["record"]))
    author_records = AuthorsRecord.get_records_by_pids(
        ("aut", str(recid)) for recid in author_recids_with_claims
    )

    all_ids = (author.get("ids", []) for author in author_records)
    orcids_in_authors = chain.from_iterable(
        get_values_for_schema(ids, "ORCID") for ids in all_ids
    )

    return chain(orcids_on_record, orcids_in_authors)


def get_literature_recids_for_orcid(orcid):
    """Return the Literature recids that were claimed by an ORCiD.

    We record the fact that the Author record X has claimed the Literature
    record Y by storing in Y an author object with a ``$ref`` pointing to X
    and the key ``curated_relation`` set to ``True``. Therefore this method
    first searches the DB for the Author records for the one containing the
    given ORCiD, and then uses its recid to search in ES for the Literature
    records that satisfy the above property.

    Args:
        orcid (str): the ORCiD.

    Return:
        list(int): the recids of the Literature records that were claimed
        by that ORCiD.

    """
    orcid_object = f'[{{"schema": "ORCID", "value": "{orcid}"}}]'
    # this first query is written in a way that can use the index on (json -> ids)

    author_rec_uuid = (
        db.session.query(RecordMetadata.id)
        .filter(type_coerce(RecordMetadata.json, JSONB)["ids"].contains(orcid_object))
        .one()
        .id
    )

    author_record = (
        db.session.query(PersistentIdentifier)
        .filter(
            PersistentIdentifier.object_type == "rec",
            PersistentIdentifier.object_uuid == author_rec_uuid,
            PersistentIdentifier.pid_type == "aut",
        )
        .one()
    )

    author_recid = (
        author_record.pid_value
        if not author_record.is_redirected()
        else InspireRedirect.get_redirect(author_record).pid_value
    )

    query = Q("match", authors__curated_relation=True) & Q(
        "match", **{"authors.record.$ref": author_recid}
    )
    search_by_curated_author = (
        LiteratureSearch()
        .query("nested", path="authors", query=query)
        .params(_source=["control_number"], size=9999)
    )

    return [el["control_number"] for el in search_by_curated_author]


def update_moved_orcid(old_orcid, new_orcid):
    author_record = AuthorsRecord.get_record_by_pid_value(old_orcid, "orcid")
    if new_orcid not in get_value(author_record, "ids.value", []):
        new_author_ids = [
            {"schema": "ORCID", "value": new_orcid},
            *author_record["ids"],
        ]
        author_record["ids"] = new_author_ids
        author_record.update(dict(author_record))
    remove_access_token_for_orcid_account(old_orcid, new_orcid)
    db.session.commit()
    LOGGER.info("ORCID updated", new_orcid=new_orcid, old_orcid=old_orcid)


def remove_access_token_for_orcid_account(orcid, new_orcid):
    user_orcid_account = RemoteAccount.query.filter(
        RemoteAccount.user_id == UserIdentity.id_user, UserIdentity.id == orcid
    ).one()
    user_orcid_account.extra_data["orcid"] = new_orcid
    user_orcid_account.extra_data["allow_push"] = False
    UserIdentity.query.filter(
        user_orcid_account.user_id == UserIdentity.id_user,
    ).first().id = new_orcid
    access_token = user_orcid_account.remote_tokens[0]
    delete_access_token(access_token.access_token, new_orcid)
    user_email = User.query.filter(User.id == user_orcid_account.user_id).first().email
    send_orcid_push_disabled_email(user_email, orcid)
