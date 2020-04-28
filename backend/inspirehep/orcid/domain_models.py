# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app
from inspire_service_orcid import exceptions as orcid_client_exceptions
from inspire_service_orcid.client import OrcidClient
from invenio_pidstore.errors import PIDDoesNotExistError
from time_execution import time_execution

from inspirehep.records.api import LiteratureRecord

from . import exceptions, push_access_tokens, utils
from .cache import OrcidCache
from .converter import OrcidConverter
from .putcode_getter import OrcidPutcodeGetter

LOGGER = structlog.getLogger()


class OrcidPusher(object):
    def __init__(
        self,
        orcid,
        recid,
        oauth_token,
        pushing_duplicated_identifier=False,
        record_db_version=None,
    ):
        self.orcid = orcid
        self.recid = str(recid)
        self.oauth_token = oauth_token
        self.pushing_duplicated_identifier = pushing_duplicated_identifier
        self.record_db_version = record_db_version
        self.inspire_record = self._get_inspire_record()
        self.cache = OrcidCache(orcid, recid)
        self.lock_name = "orcid:{}".format(self.orcid)
        self.client = OrcidClient(self.oauth_token, self.orcid)
        self.converter = None
        self.cached_author_putcodes = {}

    @time_execution
    def _get_inspire_record(self):
        try:
            inspire_record = LiteratureRecord.get_record_by_pid_value(self.recid)
        except PIDDoesNotExistError as exc:
            raise exceptions.RecordNotFoundException(
                "recid={} not found for pid_type=lit".format(self.recid), from_exc=exc
            )

        # If the record_db_version was given, then ensure we are about to push
        # the right record version.
        # This check is related to the fact the orcid push at this moment is
        # triggered by the signal after_record_update (which happens after a
        # InspireRecord.commit()). This is not the actual commit to the db which
        # might happen at a later stage or not at all.
        # Note that connecting to the proper SQLAlchemy signal would also
        # have issues: https://github.com/mitsuhiko/flask-sqlalchemy/issues/645
        if (
            self.record_db_version
            and inspire_record.model.version_id < self.record_db_version
        ):
            raise exceptions.StaleRecordDBVersionException(
                "Requested push for db version={}, but actual record db"
                " version={}".format(
                    self.record_db_version, inspire_record.model.version_id
                )
            )
        return inspire_record

    @property
    def _do_force_cache_miss(self):
        """
        Hook to force a cache miss. This can be leveraged in feature tests.
        """
        for note in self.inspire_record.get("_private_notes", []):
            if note.get("value") == "orcid-push-force-cache-miss":
                LOGGER.debug(
                    "OrcidPusher force cache miss", recid=self.recid, orcid=self.orcid
                )
                return True
        return False

    @property
    def _is_record_deleted(self):
        # Hook to force a delete. This can be leveraged in feature tests.
        for note in self.inspire_record.get("_private_notes", []):
            if note.get("value") == "orcid-push-force-delete":
                LOGGER.debug(
                    "OrcidPusher force delete", recid=self.recid, orcid=self.orcid
                )
                return True
        return self.inspire_record.get("deleted", False)

    @time_execution  # noqa: C901
    def push(self):
        putcode = None
        if not self._do_force_cache_miss:
            putcode = self.cache.read_work_putcode()
            if not self._is_record_deleted and not self.cache.has_work_content_changed(
                self.inspire_record
            ):
                LOGGER.debug(
                    "OrcidPusher cache hit", recid=self.recid, orcid=self.orcid
                )
                return putcode
        LOGGER.debug("OrcidPusher cache miss", recid=self.recid, orcid=self.orcid)

        # If the record is deleted, then delete it.
        if self._is_record_deleted:
            self._delete_work(putcode)
            return None

        self.converter = OrcidConverter(
            record=self.inspire_record,
            url_pattern=current_app.config["LEGACY_RECORD_URL_PATTERN"],
            put_code=putcode,
        )

        try:
            putcode = self._post_or_put_work(putcode)
        except orcid_client_exceptions.WorkAlreadyExistsException:
            # We POSTed the record as new work, but it failed because
            # a work with the same identifier is already in ORCID.
            # This can mean two things:
            # 1. the record itself is already in ORCID, but we don't have the putcode;
            # 2. a different record with the same external identifier is already in ORCID.
            # We first try to fix 1. by caching all author's putcodes and PUT the work again.
            # If the putcode wasn't found we are probably facing case 2.
            # so we try to push once again works with clashing identifiers
            # to update them and resolve the potential conflict.
            if self.pushing_duplicated_identifier:
                raise exceptions.DuplicatedExternalIdentifierPusherException
            putcode = self._cache_all_author_putcodes()
            if not putcode:
                try:
                    self._push_work_with_clashing_identifier()
                    putcode = self._post_or_put_work(putcode)
                except orcid_client_exceptions.WorkAlreadyExistsException:
                    # The PUT/POST failed despite pushing works with clashing identifiers
                    # and we can't do anything about this.
                    raise exceptions.DuplicatedExternalIdentifierPusherException
            else:
                self._post_or_put_work(putcode)
        except orcid_client_exceptions.DuplicatedExternalIdentifierException:
            # We PUT a record changing its identifier, but there is another work
            # in ORCID with the same identifier. We need to find out the recid
            # of the clashing work in ORCID and push a fresh version of that
            # record.
            # This scenario might be triggered by a merge of 2 records in Inspire.
            if not self.pushing_duplicated_identifier:
                self._push_work_with_clashing_identifier()
            # Raised exception will cause retry of celery task
            raise exceptions.DuplicatedExternalIdentifierPusherException
        except orcid_client_exceptions.PutcodeNotFoundPutException:
            # We try to push the work with invalid putcode, so we delete
            # its putcode and push it without any putcode.
            # If it turns out that the record already exists
            # in ORCID we search for the putcode by caching
            # all author's putcodes and PUT the work again.
            self.cache.delete_work_putcode()
            self.converter = OrcidConverter(
                record=self.inspire_record,
                url_pattern=current_app.config["LEGACY_RECORD_URL_PATTERN"],
                put_code=None,
            )
            putcode = self._cache_all_author_putcodes()
            self._post_or_put_work(putcode)
        except (
            orcid_client_exceptions.TokenInvalidException,
            orcid_client_exceptions.TokenMismatchException,
            orcid_client_exceptions.TokenWithWrongPermissionException,
        ):
            LOGGER.info(
                "Deleting Orcid push access", token=self.oauth_token, orcid=self.orcid
            )
            push_access_tokens.delete_access_token(self.oauth_token, self.orcid)
            raise exceptions.TokenInvalidDeletedException
        except orcid_client_exceptions.BaseOrcidClientJsonException as exc:
            raise exceptions.InputDataInvalidException(from_exc=exc)

        self.cache.write_work_putcode(putcode, self.inspire_record)
        return putcode

    @time_execution
    def _post_or_put_work(self, putcode=None):
        # Note: if putcode is None, then it's a POST (it means the work is new).
        # Otherwise a PUT (it means the work already exists and it has the given
        # putcode).

        xml_element = self.converter.get_xml(do_add_bibtex_citation=True)
        # ORCID API allows 1 non-idempotent call only for the same orcid at
        # the same time. Using `distributed_lock` to achieve this.

        with utils.distributed_lock(self.lock_name, blocking=True):
            if putcode:
                response = self.client.put_updated_work(xml_element, putcode)
            else:
                response = self.client.post_new_work(xml_element)
        LOGGER.info("POST/PUT ORCID work", recid=self.recid)
        response.raise_for_result()
        return response["putcode"]

    def _delete_works_with_duplicated_putcodes(self, cached_putcodes_recids):
        unique_recids_putcodes = {}
        for fetched_putcode, fetched_recid in cached_putcodes_recids:
            if fetched_recid in unique_recids_putcodes:
                self._delete_work(fetched_putcode)
            else:
                unique_recids_putcodes[fetched_recid] = fetched_putcode
        return unique_recids_putcodes

    @time_execution
    def _cache_all_author_putcodes(self):
        LOGGER.debug("New OrcidPusher cache all author putcodes", orcid=self.orcid)

        if not self.cached_author_putcodes:
            putcode_getter = OrcidPutcodeGetter(self.orcid, self.oauth_token)
            putcodes_recids = list(
                putcode_getter.get_all_inspire_putcodes_and_recids_iter()
            )
            self.cached_author_putcodes = self._delete_works_with_duplicated_putcodes(
                putcodes_recids
            )

        putcode = None
        for fetched_recid, fetched_putcode in self.cached_author_putcodes.items():
            if fetched_recid == self.recid:
                putcode = int(fetched_putcode)
            cache = OrcidCache(self.orcid, fetched_recid)
            cache.write_work_putcode(fetched_putcode)

        # Ensure the putcode is actually in cache.
        # Note: this step is not really necessary and it can be skipped, but
        # at this moment it helps isolate a potential issue.
        if putcode and not self.cache.read_work_putcode():
            raise exceptions.PutcodeNotFoundInCacheAfterCachingAllPutcodes(
                "No putcode={} found in cache for recid={} after having"
                " cached all author putcodes for orcid={}".format(
                    self.putcode, self.recid, self.orcid
                )
            )

        return putcode

    @time_execution
    def _delete_work(self, putcode=None):
        putcode = putcode or self._cache_all_author_putcodes()
        if not putcode:
            # Such recid does not exists (anymore?) in ORCID API.
            return

        # ORCID API allows 1 non-idempotent call only for the same orcid at
        # the same time. Using `distributed_lock` to achieve this.
        with utils.distributed_lock(self.lock_name, blocking=True):
            response = self.client.delete_work(putcode)
        try:
            response.raise_for_result()
        except orcid_client_exceptions.PutcodeNotFoundDeleteException:
            # Such putcode does not exists (anymore?) in orcid.
            pass
        except orcid_client_exceptions.BaseOrcidClientJsonException as exc:
            raise exceptions.InputDataInvalidException(from_exc=exc)

        self.cache.delete_work_putcode()

    @time_execution
    def _push_work_with_clashing_identifier(self):
        putcode_getter = OrcidPutcodeGetter(self.orcid, self.oauth_token)

        ids = self.converter.added_external_identifiers
        putcodes_recids = putcode_getter.get_putcodes_and_recids_by_identifiers_iter(
            ids
        )
        updated_putcodes_recid = self._delete_works_with_duplicated_putcodes(
            putcodes_recids
        )

        for (recid, putcode) in updated_putcodes_recid.items():

            if not putcode or not recid:
                continue
            if recid == self.recid:
                continue
            # Local import to avoid import error.
            from inspirehep.orcid import tasks

            tasks.orcid_push(
                self.orcid,
                recid,
                self.oauth_token,
                dict(
                    pushing_duplicated_identifier=True,
                    record_db_version=self.record_db_version,
                ),
            )
