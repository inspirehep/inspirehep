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


import copy
import logging
import os

import mock
import pkg_resources
import pytest
from celery.exceptions import TimeLimitExceeded
from fqn_decorators.decorators import get_fqn
from helpers.factories.db.invenio_oauthclient import TestRemoteToken
from helpers.factories.db.invenio_records import TestRecordMetadata
from helpers.utils import override_config
from inspire_service_orcid import exceptions as orcid_client_exceptions
from inspire_service_orcid.client import OrcidClient
from lxml import etree

from inspirehep.orcid import cache as cache_module
from inspirehep.orcid import domain_models, exceptions, push_access_tokens
from inspirehep.orcid.cache import OrcidCache

# The tests are written in a specific order, disable random
pytestmark = pytest.mark.random_order(disabled=True)


class TestOrcidPusherBase(object):

    ORCID_1 = "0000-0003-1134-6827"
    ORCID_2 = "0000-0001-8627-769X"

    @staticmethod
    def _oauth_token(orcid):
        from flask import current_app  # Note: isolated_app not available in setup().

        # Pick the token from local inspirehep.cfg first.
        return current_app.config.get("ORCID_APP_LOCAL_TOKENS", {}).get(
            orcid, "mytoken"
        )

    @property
    def oauth_token(self):
        return TestOrcidPusherBase._oauth_token(self.orcid)

    @property
    def cache(self):
        return OrcidCache(self.orcid, self.recid)

    @property
    def orcid_client(self):
        return OrcidClient(self.oauth_token, self.orcid)

    def add_work(self, filename):
        data_xml = self.read_from_file(filename)
        etree_from_stringlist = etree.fromstringlist(data_xml)
        result = self.orcid_client.post_new_work(etree_from_stringlist)
        return result["putcode"]

    def read_from_file(self, filename):
        xml_file = pkg_resources.resource_filename(
            __name__, os.path.join("fixtures", filename)
        )
        with open(xml_file, "rb") as f:
            work_xml = f.readlines()
        return work_xml

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

    @staticmethod
    def delete_work_for_orcid(orcid):
        oauth_token = TestOrcidPusherBase._oauth_token(orcid)
        client = OrcidClient(oauth_token, orcid)
        all_work = client.get_all_works_summary()
        for work in all_work.get("group", []):
            putcode = work["work-summary"][0]["put-code"]
            client.delete_work(putcode)

    @staticmethod
    def _delete_all_work():
        TestOrcidPusherBase.delete_work_for_orcid(TestOrcidPusherBase.ORCID_1)
        TestOrcidPusherBase.delete_work_for_orcid(TestOrcidPusherBase.ORCID_2)

    def teardown_class(cls):
        # repeats many of the parts, refactor more
        TestOrcidPusherBase._delete_all_work()

    def delete_all_work(self):
        TestOrcidPusherBase._delete_all_work()


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherCache(TestOrcidPusherBase):
    def setup(self):

        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusher.json"
        )
        self.record_metadata = factory.record_metadata
        self.inspire_record = factory.inspire_record
        self.orcid = self.ORCID_1
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
class TestOrcidPusherPostNewWork(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusherPostNewWork.json"
        )
        self.orcid = self.ORCID_1
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
        self.delete_all_work()
        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        result_putcode = pusher.push()
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
        invalid_xml = etree.fromstringlist(
            [
                '<work:work xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http:/www.orcid.orgsens/work">',
                "</work:work>",
            ]
        )
        with pytest.raises(exceptions.InputDataInvalidException):
            with mock.patch(
                "inspirehep.orcid.domain_models.OrcidConverter.get_xml",
                return_value=invalid_xml,
            ):
                pusher.push()

    def test_push_new_work_already_existing(self):
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ):
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            pusher.push()
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_new_work_already_existing_with_recids(self):
        self.orcid = self.ORCID_2
        self.cache.delete_work_putcode()
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ):
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            pusher.push()
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_new_work_already_existing_duplicated_external_identifier_exception(
        self,
    ):
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        self.recid = self.conflicting_recid
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ), pytest.raises(exceptions.DuplicatedExternalIdentifierPusherException):
            pusher = domain_models.OrcidPusher(
                self.orcid, self.conflicting_recid, self.oauth_token
            )
            pusher.push()
        assert self.cache.has_work_content_changed(self.conflicting_inspire_record)

    def test_push_new_work_already_existing_and_delete_duplicated_records_different_putcodes(
        self,
    ):
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ):
            self.add_work(
                "test_orcid_domain_models_TestOrcidPusherPostNewWork_conflicting_no_recid.xml"
            )
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            pusher.push()
            assert not self.cache.has_work_content_changed(self.inspire_record)


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherPutUpdatedWork(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusher.json"
        )
        self.orcid = self.ORCID_1
        self.recid = factory.record_metadata.json["control_number"]
        self.inspire_record = factory.inspire_record

        # Disable logging.
        logging.getLogger("inspirehep.orcid.domain_models").disabled = logging.CRITICAL

    def test_push_updated_work_happy_flow(self):
        self.putcode = self.add_work("test_orcid_domain_models_TestOrcidPusher.xml")
        self.cache.write_work_putcode(self.putcode)

        pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
        result_putcode = pusher.push()

        assert int(result_putcode) == self.putcode
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_updated_work_invalid_data_putcode(self):
        self.cache.write_work_putcode("00000")
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ):
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            result_putcode = pusher.push()
        # don't care to check the value, it's pain to keep it with
        # repeatability of the tests
        assert result_putcode
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_updated_work_no_cache(self):
        self.cache.delete_work_putcode()
        # ORCID_APP_CREDENTIALS is required because ORCID adds it as source_client_id_path.
        with override_config(
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"}
        ):
            pusher = domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)
            result_putcode = pusher.push()
            self.cache.write_work_putcode(result_putcode)
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_updated_work_invalid_data_orcid(self):
        self.orcid = "0000-0002-0000-XXXX"
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


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherDeleteWork(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusherDeleteWork.json"
        )
        self.orcid = self.ORCID_1
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
        self.recid = "-11111"
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
        self.orcid = self.ORCID_1
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

        assert self.clashing_putcode
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

    def test_duplicated_external_identifier_pusher_exception(self):
        self.factory_clashing.record_metadata.json["titles"] = [
            {"source": "submitter", "title": "title1"}
        ]
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"},
        ), pytest.raises(exceptions.DuplicatedExternalIdentifierPusherException):
            pusher = domain_models.OrcidPusher(
                self.orcid, self.clashing_recid, self.oauth_token
            )
            pusher.push()


@pytest.mark.usefixtures("base_app", "db", "es")
class TestOrcidPusherRecordDBVersion(TestOrcidPusherBase):
    def setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_domain_models_TestOrcidPusherRecordExceptions.json"
        )
        self.recid = factory.record_metadata.json["control_number"]
        self.orcid = self.ORCID_1
        # Disable logging.
        logging.getLogger("inspirehep.orcid.domain_models").disabled = logging.CRITICAL

    def test_happy_flow(self):
        pusher = domain_models.OrcidPusher(
            self.orcid, self.recid, self.oauth_token, record_db_version=1
        )
        result_putcode = pusher.push()
        assert result_putcode

    def test_record_non_existing(self):
        self.recid = "-98765"
        with pytest.raises(exceptions.RecordNotFoundException):
            domain_models.OrcidPusher(self.orcid, self.recid, self.oauth_token)

    def test_stale_record_db_version(self):
        with pytest.raises(exceptions.StaleRecordDBVersionException):
            domain_models.OrcidPusher(
                self.orcid, self.recid, self.oauth_token, record_db_version=10
            )
