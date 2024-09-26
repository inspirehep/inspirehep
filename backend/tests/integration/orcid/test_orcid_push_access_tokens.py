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

import time

import pytest
from fqn_decorators.decorators import get_fqn
from helpers.factories.db.invenio_oauthclient import TestRemoteToken
from inspirehep.orcid import push_access_tokens
from invenio_db import db
from sqlalchemy.orm.exc import NoResultFound

# The tests are written in a specific order, disable random
pytestmark = pytest.mark.random_order(disabled=True)


@pytest.mark.usefixtures("inspire_app")
class c:
    def test_single_token(self):
        orcid = "0000-0003-4792-9178"
        expected_remote_token = TestRemoteToken.create_for_orcid(orcid).remote_token

        orcids_and_tokens = push_access_tokens.get_access_tokens([orcid])

        assert len(orcids_and_tokens) == 1
        assert orcids_and_tokens[0].id == orcid
        assert orcids_and_tokens[0].access_token == expected_remote_token.access_token

    def test_multiple_tokens(self):
        orcid1 = "0000-0003-4792-9178"
        expected_remote_token1 = TestRemoteToken.create_for_orcid(orcid1).remote_token
        orcid2 = "0000-0003-4792-9179"
        expected_remote_token2 = TestRemoteToken.create_for_orcid(orcid2).remote_token

        orcids_and_tokens = push_access_tokens.get_access_tokens([orcid1, orcid2])

        assert len(orcids_and_tokens) == 2
        assert orcids_and_tokens[0].id == orcid1
        assert orcids_and_tokens[0].access_token == expected_remote_token1.access_token
        assert orcids_and_tokens[1].id == orcid2
        assert orcids_and_tokens[1].access_token == expected_remote_token2.access_token

    def test_allow_push(self):
        orcid1 = "0000-0003-4792-9178"
        expected_remote_token = TestRemoteToken.create_for_orcid(orcid1).remote_token
        orcid2 = "0000-0003-4792-9179"
        assert hasattr(
            TestRemoteToken.create_for_orcid(orcid2, allow_push=False), "remote_token"
        )

        orcids_and_tokens = push_access_tokens.get_access_tokens([orcid1, orcid2])

        assert len(orcids_and_tokens) == 1
        assert orcids_and_tokens[0].id == orcid1
        assert orcids_and_tokens[0].access_token == expected_remote_token.access_token


class TestOrcidInvalidTokensCacheBase:
    def setup_class(cls):
        cls.CACHE_EXPIRE_ORIG = push_access_tokens.CACHE_EXPIRE
        push_access_tokens.CACHE_EXPIRE = 2  # Sec.

    def setup_method(self, method):
        self.token_plain = "token1234"
        self.orcid = "0000-0003-4792-9178"
        self.cache = push_access_tokens._OrcidInvalidTokensCache(self.token_plain)
        push_access_tokens.CACHE_PREFIX = get_fqn(method)

    def teardown_method(self, method):
        self.cache.delete_invalid_token()

    def teardown_class(cls):
        push_access_tokens.CACHE_PREFIX = None
        push_access_tokens.CACHE_EXPIRE = cls.CACHE_EXPIRE_ORIG


@pytest.mark.usefixtures("inspire_app")
class TestOrcidInvalidTokensCache(TestOrcidInvalidTokensCacheBase):
    def test_write_invalid_token(self):
        self.cache.write_invalid_token(self.orcid)
        value = self.cache.redis.hgetall(self.cache._key)
        assert value["orcid"] == self.orcid

    def test_does_invalid_token_exist(self):
        self.cache.write_invalid_token(self.orcid)
        assert self.cache.does_invalid_token_exist()
        time.sleep(push_access_tokens.CACHE_EXPIRE * 1.1)
        assert not self.cache.does_invalid_token_exist()


@pytest.mark.usefixtures("inspire_app")
class TestIsAccessTokenInvalid(TestOrcidInvalidTokensCacheBase):
    def test_invalid(self):
        self.cache.write_invalid_token(self.orcid)
        assert push_access_tokens.is_access_token_invalid(self.token_plain)

    def test_valid(self):
        assert not push_access_tokens.is_access_token_invalid("nonexisting")


class TestDeleteAccessToken(TestOrcidInvalidTokensCacheBase):
    @pytest.fixture(autouse=True)
    def _token(self, inspire_app):
        self.remote_token = TestRemoteToken.create_for_orcid(self.orcid).remote_token

    def setup_method(self, method):
        self.orcid = "0000-0003-4792-9178"
        self.remote_token = TestRemoteToken.create_for_orcid(self.orcid).remote_token
        self.cache = push_access_tokens._OrcidInvalidTokensCache(
            self.remote_token.access_token
        )

    def test_happy_flow(self, inspire_app):
        push_access_tokens.delete_access_token(
            self.remote_token.access_token, self.orcid
        )
        db.session.commit()

        assert not push_access_tokens.get_access_tokens([self.orcid])
        assert push_access_tokens.is_access_token_invalid(
            self.remote_token.access_token
        )

    def test_orcid_with_no_token(self, inspire_app):
        orcid = "orcid-with-no-token"
        with pytest.raises(NoResultFound):
            push_access_tokens.delete_access_token(
                self.remote_token.access_token, orcid
            )
        db.session.commit()

    def test_token_plain_mismatch(self, inspire_app):
        token_plain = "nonexisting-token-plain"
        with pytest.raises(AssertionError):
            push_access_tokens.delete_access_token(token_plain, self.orcid)
        db.session.commit()
