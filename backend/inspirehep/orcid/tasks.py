# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Manage ORCID OAUTH token migration from INSPIRE legacy instance."""
import re

import structlog
from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded
from flask import current_app
from inspire_utils.record import get_value
from invenio_db import db
from invenio_oauthclient.errors import AlreadyLinkedError
from invenio_oauthclient.models import RemoteAccount, RemoteToken, User, UserIdentity
from invenio_oauthclient.utils import oauth_link_external_id
from redis import StrictRedis
from requests.exceptions import RequestException
from simplejson import loads
from sqlalchemy.orm.exc import FlushError

from inspirehep.orcid import exceptions as domain_exceptions
from inspirehep.orcid.utils import get_literature_recids_for_orcid

from . import domain_models, exceptions

LOGGER = structlog.getLogger()
USER_EMAIL_EMPTY_PATTERN = "{}@FAKEEMAILINSPIRE.FAKE"
ORCID_REGEX = r"\d{4}-\d{4}-\d{4}-\d{3}[0-9X]"


def legacy_orcid_arrays():
    """
    Generator to fetch token data from redis.

    Note: this function consumes the queue populated by the legacy tasklet:
    inspire/bibtasklets/bst_orcidsync.py

    Yields:
        list: user data in the form of [orcid, token, email, name]
    """
    # XXX: temp redis url when we use orcid push in kb8s
    redis_url = current_app.config.get("MIGRATION_REDIS_URL")
    if redis_url is None:
        redis_url = current_app.config.get("CACHE_REDIS_URL")
    r = StrictRedis.from_url(redis_url)

    key = "legacy_orcid_tokens"
    token = r.lpop(key)
    while token:
        yield loads(token)
        token = r.lpop(key)


def _link_user_and_token(user, name, orcid, access_token):
    """Create a link between a user and token, if possible.

    Args:
        user (invenio_oauthclient.models.User): an existing user object to connect the token to
        orcid (string): user's ORCID identifier
        access_token (string): OAUTH token for the user

    Returns:
        str: the ORCID associated with the token newly created/enabled.
    """
    try:
        # Link user and ORCID
        oauth_link_external_id(user, {"id": orcid, "method": "orcid"})
    # Note: AlreadyLinkedError becomes FlushError when testing with isolated_app.
    except (AlreadyLinkedError, FlushError):
        # User already has their ORCID linked
        pass

    # Search for existing tokens.
    # Note: there can be only 1 RemoteToken per given RemoteAccount.
    existing_remote_token = (
        RemoteToken.query.join(RemoteAccount).filter_by(user=user).one_or_none()
    )

    # If not existing_remote_token, create one.
    if not existing_remote_token:
        with db.session.begin_nested():
            RemoteToken.create(
                user_id=user.id,
                client_id=get_value(
                    current_app.config, "ORCID_APP_CREDENTIALS.consumer_key"
                ),
                token=access_token,
                secret=None,
                extra_data={"orcid": orcid, "full_name": name, "allow_push": True},
            )
        return orcid

    # If there is an existing_remote_token:
    #    ensure it is associated to this ORCID and
    #    set allow_push to True.
    #
    # Get the ORCID associated with this token.
    user_identity = UserIdentity.query.filter_by(
        user=user, method="orcid"
    ).one_or_none()

    # Ensure data consistency.
    if not user_identity:
        msg = (
            'No UserIdentity for user={}, method="orcid", while'
            " instead there is a RemoteAccount={} and RemoteToken={}"
        )
        raise Exception(
            msg.format(
                user, existing_remote_token.remote_account, existing_remote_token
            )
        )
    if user_identity.id != existing_remote_token.remote_account.extra_data["orcid"]:
        msg = "UserIdentity={} and RemoteToken={} ORCID mismatch: {} != {}"
        raise Exception(
            msg.format(
                user_identity,
                existing_remote_token,
                user_identity.id,
                existing_remote_token.remote_account.extra_data["orcid"],
            )
        )
    if existing_remote_token.remote_account.extra_data["orcid"] != orcid:
        raise RemoteTokenOrcidMismatch(
            user, [existing_remote_token.remote_account.extra_data["orcid"], orcid]
        )

    # Force the allow_push.
    with db.session.begin_nested():
        if not existing_remote_token.remote_account.extra_data["allow_push"]:
            existing_remote_token.remote_account.extra_data["allow_push"] = True
            return orcid
    return None


class RemoteTokenOrcidMismatch(Exception):
    def __init__(self, user, orcids):
        msg = (
            "A RemoteToken already exists for User={} and it is"
            " associated to a different ORCID: {}"
        ).format(user, " != ".join(orcids))
        super(RemoteTokenOrcidMismatch, self).__init__(msg)


def _register_user(name, email, orcid, token):
    """Add a token to the user, creating the user if doesn't exist.

    There are multiple possible scenarios:
    - user exists, has ORCID and token already linked
    - user exists and has their ORCID linked, but no token is associated
    - user exists, but doesn't have the ORCID identifier linked
    - user doesn't exist at all

    In all the above scenarios this will create the missing parts.

    Args:
        name (string): user's name
        email (string): user's email address
        orcid (string): user's ORCID identifier
        token (string): OAUTH authorization token

    Returns:
        str: the ORCID associated with the new user if we created one, or the
        ORCID associated with the user whose ``allow_push`` flag changed state.

    """
    if not email:
        # Generate a (fake) unique email address (because User.email is a
        # unique field).
        email = USER_EMAIL_EMPTY_PATTERN.format(orcid)

    # Try to find an existing user entry
    user = _find_user_matching(orcid, email)

    # Make the user if didn't find existing one
    if not user:
        with db.session.begin_nested():
            user = User()
            user.email = email
            user.active = True
            db.session.add(user)

    return _link_user_and_token(user, name, orcid, token)


# `soft_time_limit` is used to schedule a retry.
# `time_limit` instead kills the worker process (its exception cannot be caught
# in order to schedule a retry).
# Race conditions between the 2 limits are possible, but the orcid push
# operation is idempotent.
@shared_task(bind=True, soft_time_limit=10 * 60, time_limit=11 * 60)
def orcid_push(self, orcid, rec_id, oauth_token, kwargs_to_pusher=None):
    """Celery task to push a record to ORCID.

    Args:
        self (celery.Task): the task
        orcid (String): an orcid identifier.
        rec_id (Int): inspire record's id to push to ORCID.
        oauth_token (String): orcid token.
        kwargs_to_pusher (Dict): extra kwargs to pass to the pusher object.
    """
    if not current_app.config["FEATURE_FLAG_ENABLE_ORCID_PUSH"]:
        LOGGER.info("ORCID push feature flag not enabled")
        return

    if not re.match(
        current_app.config.get("FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX", "^$"), orcid
    ):
        LOGGER.info("ORCID push not enabled", orcid=orcid)
        return

    LOGGER.info("New orcid_push task", recid=rec_id, orcid=orcid)
    kwargs_to_pusher = kwargs_to_pusher or {}

    try:
        pusher = domain_models.OrcidPusher(
            orcid, rec_id, oauth_token, **kwargs_to_pusher
        )
        putcode = pusher.push()
        LOGGER.info("Orcid_push task successfully completed", recid=rec_id, orcid=orcid)
    except (RequestException, SoftTimeLimitExceeded) as exc:
        # Trigger a retry only in case of network-related issues.
        # RequestException is the base class for all request's library
        # exceptions.
        # OrcidPusher knows how to handle all expected HTTP exceptions and thus
        # no retry is triggered in such cases.
        # Other kinds of exceptions (like IOError or anything else due to bugs)
        # does not trigger a retry.

        # Enrich exception message.
        if isinstance(exc, RequestException):
            message = (exc.args[0:1] or ("",))[0]
            try:
                message += "\nResponse={}".format(exc.response.content)
            except AttributeError:
                pass
            message += "\nRequest={} {}".format(exc.request.method, exc.request.url)
            exc.args = (message,) + exc.args[1:]

        # If max_retries=3, then self.request.retries is: [0, 1, 2, 3]
        # thus backoff power 4 is (secs): [4*60, 16*60, 64*60]
        backoff = (4 ** (self.request.retries + 1)) * 60

        LOGGER.warning(
            f"Orcid_push task raised an exception. Retrying in {backoff} secs.",
            recid=rec_id,
            orcid=orcid,
        )
        raise self.retry(max_retries=3, countdown=backoff, exc=exc)
    except (
        exceptions.DuplicatedExternalIdentifierPusherException,
        domain_exceptions.RecordNotFoundException,
        domain_exceptions.StaleRecordDBVersionException,
    ) as exc:
        # If max_retries=4, then self.request.retries is: [0, 1, 2, 3, 4]
        # thus backoff power 5 is (secs): [5, 25, 125, 625]
        backoff = 5 ** (self.request.retries + 1)
        raise self.retry(max_retries=4, countdown=backoff, exc=exc)
    except Exception:
        LOGGER.warning("Orcid_push task failed", recid=rec_id, orcid=orcid)
        raise
    return putcode


def _find_user_matching(orcid, email):
    """Attempt to find a user in our DB on either ORCID or email."""
    user_identity = UserIdentity.query.filter_by(id=orcid, method="orcid").first()
    if user_identity:
        return user_identity.user
    return User.query.filter_by(email=email).one_or_none()


@shared_task
def push_account_literature_to_orcid(orcid, token):
    recids = get_literature_recids_for_orcid(orcid)
    for recid in recids:
        orcid_push.apply_async(
            queue="orcid_push_legacy_tokens",
            kwargs={"orcid": orcid, "rec_id": recid, "oauth_token": token},
        )
