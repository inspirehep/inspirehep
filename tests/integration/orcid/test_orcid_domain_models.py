# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2018 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

from __future__ import absolute_import, division, print_function

import copy
import logging

import mock
import pytest
from celery.exceptions import TimeLimitExceeded
from fqn_decorators.decorators import get_fqn
from helpers.factories.db.invenio_oauthclient import TestRemoteToken
from helpers.factories.db.invenio_records import TestRecordMetadata
from helpers.utils import override_config
from inspire_service_orcid.client import OrcidClient

from inspirehep.orcid import cache as cache_module
from inspirehep.orcid import domain_models, exceptions, push_access_tokens
from inspirehep.orcid.cache import OrcidCache


class TestOrcidPusherBase(object):
    @property
    def oauth_token(self):
        from flask import current_app  # Note: isolated_app not available in setup().

        # Pick the token from local inspirehep.cfg first.
        return current_app.config.get("ORCID_APP_LOCAL_TOKENS", {}).get(
            self.orcid, "mytoken"
        )

    @property
    def cache(self):
        return OrcidCache(self.orcid, self.recid)

    def setup_method(self, method):
        cache_module.CACHE_PREFIX = get_fqn(method)
        push_access_tokens.CACHE_PREFIX = get_fqn(method)
        self.CACHE_EXPIRE_ORIG = push_access_tokens.CACHE_EXPIRE
        push_access_tokens.CACHE_EXPIRE = 2  # Sec.

    def teardown(self):
        self.cache.delete_work_putcode()
        logging.getLogger("inspirehep.orcid.domain_models").disabled = 0
        cache_module.CACHE_PREFIX = None
        push_access_tokens.CACHE_PREFIX = None
        push_access_tokens.CACHE_EXPIRE = self.CACHE_EXPIRE_ORIG


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherCache(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusher.json"
        )
        self.record_metadata = factory.record_metadata
        self.inspire_record = factory.inspire_record
        self.orcid = "0000-0003-1134-6827"
        self.recid = factory.record_metadata.json["control_number"]

        # Disable logging.
        logging.getLogger("inspirehep.orcid.domain_models").disabled = logging.CRITICAL

    def test_push_cache_hit_content_not_changed(self):
        putcode = "00000"
        self.cache.write_work_putcode(putcode, self.inspire_record)

        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        result_putcode = pusher.push()
        assert result_putcode == putcode

    def test_push_force_cache_miss(self):
        putcode = "00000"
        self.record_metadata.json["_private_notes"] = [
            {"value": "orcid-push-force-cache-miss"}
        ]
        self.cache.write_work_putcode(putcode, self.inspire_record)

        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        with mock.patch.object(OrcidClient, "post_new_work") as mock_post_new_work:
            mock_post_new_work.return_value.__getitem__.return_value = "0000"
            pusher.push()
            mock_post_new_work.assert_called_once()

    def test_push_cache_hit_content_changed(self):
        putcode = "00000"
        cache_inspire_record = copy.deepcopy(self.inspire_record)
        cache_inspire_record["titles"][0]["title"] = "foo"
        self.cache.write_work_putcode(putcode, cache_inspire_record)

        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        with mock.patch.object(
            OrcidClient, "put_updated_work"
        ) as mock_put_updated_work:
            mock_put_updated_work.return_value.__getitem__.return_value = "0000"
            pusher.push()
        mock_put_updated_work.assert_called_once_with(mock.ANY, putcode)


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherPutUpdatedWork(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusher.json"
        )
        self.orcid = "0000-0003-1134-6827"
        self.recid = factory.record_metadata.json["control_number"]
        self.inspire_record = factory.inspire_record
        self.putcode = "57489360"
        self.cache.write_work_putcode(self.putcode)

        # Disable logging.
        logging.getLogger("inspirehep.orcid.domain_models").disabled = logging.CRITICAL

    def test_push_updated_work_happy_flow(self):
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        result_putcode = pusher.push()
        assert result_putcode == int(self.putcode)
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_updated_work_invalid_data_orcid(self):
        self.orcid = "0000-0002-0000-XXXX"
        self.putcode = "57489360"
        self.cache.write_work_putcode(self.putcode)
        access_token = "tokeninvalid"
        TestRemoteToken.create_for_orcid(self.orcid, access_token=access_token)

        pusher = domain_models.OrcidPusher(self.orcid, self.recid, access_token)
        with pytest.raises(exceptions.TokenInvalidDeletedException):
            pusher.push()

    def test_push_updated_work_invalid_data_token(self):
        access_token = "tokeninvalid"
        TestRemoteToken.create_for_orcid(self.orcid, access_token=access_token)
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, access_token)
        with pytest.raises(exceptions.TokenInvalidDeletedException):
            pusher.push()
        assert not push_access_tokens.get_access_tokens([self.orcid])
        assert push_access_tokens.is_access_token_invalid(access_token)

    def test_push_updated_work_invalid_data_putcode(self):
        self.cache.write_work_putcode("00000")
        self.orcid = "0000-0001-8627-769X"
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        result_putcode = pusher.push()
        assert result_putcode == 57532452


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherPostNewWork(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusherPostNewWork.json"
        )
        self.orcid = "0000-0003-1134-6827"
        self.recid = factory.record_metadata.json["control_number"]
        self.inspire_record = factory.inspire_record
        # Disable logging.
        logging.getLogger("inspirehep.orcid.domain_models").disabled = logging.CRITICAL

        factory_conflicting = TestRecordMetadata.create_from_file(
            __name__,
            "test_orcid_domain_models_TestOrcidPusherPostNewWork_conflicting_doi.json",
        )
        self.conflicting_recid = factory_conflicting.record_metadata.json[
            "control_number"
        ]
        self.conflicting_inspire_record = factory.inspire_record

    def test_push_new_work_happy_flow(self):
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        result_putcode = pusher.push()
        assert result_putcode == 57489360
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_new_work_invalid_data_orcid(self):
        orcid = "0000-0002-0000-XXXX"

        pusher = domain_models.OrcidPusher(orcid, self.recid, self.oauth_token)
        with pytest.raises(exceptions.InputDataInvalidException):
            pusher.push()

    def test_push_new_work_invalid_data_token(self):
        access_token = "tokeninvalid"
        TestRemoteToken.create_for_orcid(self.orcid, access_token=access_token)
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, access_token)
        with pytest.raises(exceptions.TokenInvalidDeletedException):
            pusher.push()
        assert not push_access_tokens.get_access_tokens([self.orcid])
        assert push_access_tokens.is_access_token_invalid(access_token)

    def test_push_new_work_invalid_data_xml(self):
        # Note: the recorded cassette returns (magically) a proper error.
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        with pytest.raises(exceptions.InputDataInvalidException):
            pusher.push()

    def test_push_new_work_already_existing(self):
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ):
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            result_putcode = pusher.push()
        assert result_putcode == 57489360
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_new_work_already_existing_with_recids(self):
        self.orcid = "0000-0001-8627-769X"
        self.cache.delete_work_putcode()
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ):
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            result_putcode = pusher.push()
        assert result_putcode == 57492655
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_new_work_already_existing_putcode_exception(self):
        pusher = domain_models.OrcidPusher(
            self.orcid, self.conflicting_recid, self.oauth_token
        )
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ), pytest.raises(exceptions.PutcodeNotFoundInOrcidException):
            pusher.push()
        self.recid = self.conflicting_recid
        assert self.cache.has_work_content_changed(self.conflicting_inspire_record)


@pytest.mark.usefixtures("base_app", "db", "es_clear")
class TestOrcidPusherDeleteWork(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusherDeleteWork.json"
        )
        self.orcid = "0000-0003-1134-6827"
        self.recid = factory.record_metadata.json["control_number"]
        self.inspire_record = factory.inspire_record
        # Disable logging.
        logging.getLogger("inspirehep.orcid.domain_models").disabled = logging.CRITICAL
        self.cache.delete_work_putcode()

    def test_delete_work_cache_miss(self):
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ):
            assert not pusher.push()

    def test_delete_work_cache_hit(self):
        self.cache.write_work_putcode("51389857")
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        assert not pusher.push()

    def test_delete_work_cache_putcode_nonexisting(self):
        self.recid = "000000"
        TestRecordMetadata.create_from_kwargs(
            json={"control_number": self.recid, "deleted": True}
        )
        self.cache.write_work_putcode("51391229")
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        assert not pusher.push()

    def test_delete_work_force_delete(self):
        self.recid = "99"
        TestRecordMetadata.create_from_kwargs(
            json={
                "control_number": self.recid,
                "deleted": False,
                "_private_notes": [{"value": "orcid-push-force-delete"}],
            }
        )
        self.cache.write_work_putcode("51391229")

        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        assert not pusher.push()

    def test_delete_work_invalid_token(self):
        access_token = "tokeninvalid"
        TestRemoteToken.create_for_orcid(self.orcid, access_token=access_token)
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, access_token)
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ), pytest.raises(exceptions.TokenInvalidDeletedException):
            pusher.push()
        assert not push_access_tokens.get_access_tokens([self.orcid])
        assert push_access_tokens.is_access_token_invalid(access_token)


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherDuplicatedIdentifier(TestOrcidPusherBase):
    @property
    def cache_clashing(self):
        return OrcidCache(self.orcid, self.clashing_recid)

    def setup(self):
        self.factory = TestRecordMetadata.create_from_file(
            __name__,
            "test_orcid_domain_models_TestOrcidPusherDuplicatedIdentifier.json",
        )
        self.factory_clashing = TestRecordMetadata.create_from_file(
            __name__,
            "test_orcid_domain_models_TestOrcidPusherDuplicatedIdentifier_clashing.json",
        )
        self.orcid = "0000-0003-1134-6827"
        self.recid = self.factory.record_metadata.json["control_number"]
        self.clashing_recid = self.factory_clashing.record_metadata.json[
            "control_number"
        ]

        self.inspire_record = self.factory.inspire_record
        self.clashing_record = self.factory_clashing.inspire_record
        # Disable logging.
        logging.getLogger("inspirehep.orcid.domain_models").disabled = logging.CRITICAL

    def teardown(self):
        self.cache.delete_work_putcode()
        self.cache_clashing.delete_work_putcode()
        logging.getLogger("inspirehep.orcid.domain_models").disabled = 0
        cache_module.CACHE_PREFIX = None

    def test_happy_flow_post(self):
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"},
        ):
            self.factory.record_metadata.json["deleted"] = True
            pusher = domain_models.OrcidPusher(
                self.orcid, self.clashing_recid, self.oauth_token
            )
            self.clashing_putcode = pusher.push()
        assert self.clashing_putcode == 57651700
        assert not self.cache_clashing.has_work_content_changed(self.clashing_record)

    def test_happy_flow_put(self):
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"},
        ):
            dois = self.factory.record_metadata.json.pop("dois")

            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            self.putcode = pusher.push()

            self.factory.record_metadata.json["dois"] = dois
            self.factory_clashing.record_metadata.json["deleted"] = True

            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            result_putcode = pusher.push()

        assert self.putcode == result_putcode
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_exc_in_apply_celery_task_with_retry(self):
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"},
        ), mock.patch(
            "inspirehep.orcid.utils.apply_celery_task_with_retry"
        ) as apply_celery_task_with_retry_mock, pytest.raises(
            TimeLimitExceeded
        ):
            apply_celery_task_with_retry_mock.side_effect = TimeLimitExceeded
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            pusher.push()

    def test_duplicated_external_identifier_pusher_exception(self):
        self.factory_clashing.record_metadata.json["titles"] = [
            {"source": "submitter", "title": "title1"}
        ]

        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"},
        ), pytest.raises(exceptions.DuplicatedExternalIdentifierPusherException):
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            pusher.push()


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherRecordDBVersion(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusherRecordExceptions.json"
        )
        self.recid = factory.record_metadata.json["control_number"]
        self.orcid = "0000-0003-1134-6827"
        # Disable logging.
        logging.getLogger("inspirehep.orcid.domain_models").disabled = logging.CRITICAL

    def test_happy_flow(self):
        pusher = domain_models.OrcidPusher(
            self.orcid, self.recid, self.oauth_token, record_db_version=1
        )
        result_putcode = pusher.push()
        assert result_putcode == 57617712

    def test_record_non_existing(self):
        self.recid = "doesnotexists"
        with pytest.raises(exceptions.RecordNotFoundException):
            domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)

    def test_stale_record_db_version(self):
        with pytest.raises(exceptions.StaleRecordDBVersionException):
            domain_models.OrcidPusher(
                self.orcid, self.recid, self.oauth_token, record_db_version=10
            )
