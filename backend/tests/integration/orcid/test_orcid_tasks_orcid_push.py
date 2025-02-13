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

import logging
import re
from pathlib import Path

import mock
import orjson
import pytest
from flask import current_app
from fqn_decorators.decorators import get_fqn
from helpers.utils import create_record
from inspire_service_orcid.exceptions import MovedPermanentlyException
from inspirehep.orcid import cache as cache_module
from inspirehep.orcid import exceptions as domain_exceptions
from inspirehep.orcid.cache import OrcidCache
from inspirehep.orcid.tasks import orcid_push
from requests.exceptions import RequestException

# The tests are written in a specific order, disable random
pytestmark = pytest.mark.random_order(disabled=True)


class TestFeatureFlagOrcidPushWhitelistRegex:
    def test_whitelist_regex_none(self):
        FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX = "^$"

        compiled = re.compile(FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX)
        assert not re.match(compiled, "0000-0002-7638-5686")
        assert not re.match(compiled, "foo")
        # Be careful with the empty string.
        assert re.match(compiled, "")

    def test_whitelist_regex_any(self):
        FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX = ".*"

        compiled = re.compile(FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX)
        assert re.match(compiled, "0000-0002-7638-5686")
        assert re.match(compiled, "foo")
        assert re.match(compiled, "")

    def test_whitelist_regex_some(self):
        FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX = (
            "^(0000-0002-7638-5686|0000-0002-7638-5687)$"
        )

        compiled = re.compile(FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX)
        assert re.match(compiled, "0000-0002-7638-5686")
        assert not re.match(compiled, "0000-0002-7638-5686XX")
        assert not re.match(compiled, "0000-0002-7638-56")
        assert not re.match(compiled, "0000-0002-7638-5689")
        assert not re.match(compiled, "foo")
        assert not re.match(compiled, "")


@pytest.mark.usefixtures("inspire_app")
class TestOrcidPushFeatureFlag:
    def setup(self):
        self._patcher = mock.patch("inspirehep.orcid.domain_models.OrcidPusher")
        self.mock_pusher = self._patcher.start()

        self.orcid = "0000-0002-7638-5686"
        self.recid = "myrecid"
        self.oauth_token = "mytoken"

        # Disable logging.
        logging.getLogger("inspirehep.orcid.tasks").disabled = logging.CRITICAL

    def teardown(self):
        self._patcher.stop()
        logging.getLogger("inspirehep.orcid.tasks").disabled = 0

    def test_main_feature_flag(self, override_config):
        regex = ".*"
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=False,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=regex,
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)

        self.mock_pusher.assert_not_called()

    def test_whitelist_regex_any(self, override_config):
        regex = ".*"
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=regex,
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)

        self.mock_pusher.assert_called_once_with(
            self.orcid, self.recid, self.oauth_token
        )

    def test_whitelist_regex_none(self, override_config):
        regex = "^$"
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=regex,
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)

        self.mock_pusher.assert_not_called()

    def test_whitelist_regex_some(self, override_config):
        regex = "^(0000-0002-7638-5686|0000-0002-7638-5687)$"
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=regex,
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)

            self.mock_pusher.assert_called_once_with(
                self.orcid, self.recid, self.oauth_token
            )


@pytest.mark.usefixtures("inspire_app")
class TestOrcidPushRetryTask:
    def setup(self):
        self._patcher = mock.patch("inspirehep.orcid.domain_models.OrcidPusher")
        self.mock_pusher = self._patcher.start()

        self.orcid = "0000-0002-7638-5686"
        self.recid = "myrecid"
        self.oauth_token = "mytoken"

        # Disable logging.
        logging.getLogger("inspirehep.orcid.tasks").disabled = logging.CRITICAL

    def teardown(self):
        self._patcher.stop()
        logging.getLogger("inspirehep.orcid.tasks").disabled = 0

    def test_happy_flow(self, override_config):
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)

        self.mock_pusher.assert_called_once_with(
            self.orcid, self.recid, self.oauth_token
        )
        self.mock_pusher.return_value.push.assert_called_once()

    def test_retry_triggered(self, override_config):
        exc = RequestException()
        exc.response = mock.Mock()
        exc.request = mock.Mock()
        self.mock_pusher.return_value.push.side_effect = exc

        with (
            override_config(
                FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
                FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ),
            mock.patch(
                "inspirehep.orcid.tasks.orcid_push.retry", side_effect=RequestException
            ) as mock_orcid_push_task_retry,
            pytest.raises(RequestException),
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)

        self.mock_pusher.assert_called_once_with(
            self.orcid, self.recid, self.oauth_token
        )
        self.mock_pusher.return_value.push.assert_called_once()
        mock_orcid_push_task_retry.assert_called_once()

    def test_retry_not_triggered(self, override_config):
        self.mock_pusher.return_value.push.side_effect = IOError

        with (
            override_config(
                FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
                FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ),
            mock.patch(
                "inspirehep.orcid.tasks.orcid_push.retry"
            ) as mock_orcid_push_task_retry,
            pytest.raises(OSError),  # noqa PT011
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)

        self.mock_pusher.assert_called_once_with(
            self.orcid, self.recid, self.oauth_token
        )
        self.mock_pusher.return_value.push.assert_called_once()
        mock_orcid_push_task_retry.assert_not_called()


def get_local_access_tokens(orcid):
    # Pick the token from local inspirehep.cfg first.
    # This way you can store tokens in your local inspirehep.cfg (ignored
    # by git). This is handy when recording new episodes.
    local_tokens = current_app.config.get("ORCID_APP_LOCAL_TOKENS")
    if local_tokens:
        return local_tokens.get(orcid)
    return None


class TestOrcidPushTask:
    # NOTE: Only a few test here (1 happy flow and a few error flows). Exhaustive
    # testing is done in the domain model tests.

    @pytest.fixture(autouse=True)
    def _record(self, inspire_app):
        record_data = orjson.loads(
            (
                Path(__file__).parent
                / "fixtures"
                / "test_orcid_tasks_orcid_push_TestOrcidPush.json"
            ).read_text()
        )
        self.inspire_record = create_record("lit", data=record_data)
        self.inspire_record.pop(
            "texkeys", None
        )  # NOTE: poping texkeys as they generate a random value and causing side effects
        self.recid = self.inspire_record["control_number"]

    def setup(self, method):
        self.orcid = "0000-0003-1134-6827"
        self.cache = OrcidCache(self.orcid, 45)
        self.oauth_token = get_local_access_tokens(self.orcid) or "mytoken"
        cache_module.CACHE_PREFIX = get_fqn(method)

    def teardown(self):
        self.cache.delete_work_putcode()
        cache_module.CACHE_PREFIX = None

    def test_push_new_work_happy_flow(self, override_config):
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_push_new_work_invalid_data_orcid(self, override_config):
        with (
            override_config(
                FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
                FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ),
            pytest.raises(domain_exceptions.InputDataInvalidException),
        ):
            orcid_push("0000-0003-0000-XXXX", self.recid, self.oauth_token)

    def test_push_new_work_already_existing(self, override_config):
        self.cache.delete_work_putcode()
        with override_config(
            FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
            FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ORCID_APP_CREDENTIALS={"consumer_key": "0000-0001-8607-8906"},
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)
        assert not self.cache.has_work_content_changed(self.inspire_record)

    def test_stale_record_db_version(self, override_config):
        with (
            override_config(
                FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
                FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ),
            pytest.raises(domain_exceptions.StaleRecordDBVersionException),
        ):
            orcid_push(
                self.orcid,
                self.recid,
                self.oauth_token,
                kwargs_to_pusher=dict(record_db_version=100),
            )

    def test_push_new_work_moved_permanently_orcid_account_exception(
        self, override_config
    ):
        exc = MovedPermanentlyException()
        exc.args = (
            (
                "{'response-code': 301, 'developer-message': '301 Moved Permanently:"
                " This account is deprecated. Please refer to account:"
                " https://qa.orcid.org/0000-0003-1134-6827. ORCID"
                " https://qa.orcid.org/0000-1111-0000-0000', 'user-message': 'The"
                " resource was not found.'"
            ),
        )
        self._patcher = mock.patch(
            "inspirehep.orcid.domain_models.OrcidPusher._post_or_put_work"
        )
        self.mock_pusher = self._patcher.start()
        self.mock_pusher.side_effect = exc
        with (
            override_config(
                FEATURE_FLAG_ENABLE_ORCID_PUSH=True,
                FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX=".*",
            ),
            mock.patch(
                "inspirehep.orcid.domain_models.utils.update_moved_orcid"
            ) as mock_update_orcid,
            pytest.raises(MovedPermanentlyException),
        ):
            orcid_push(self.orcid, self.recid, self.oauth_token)

        assert mock_update_orcid.mock_calls[0][1] == (
            "0000-0003-1134-6827",
            "0000-1111-0000-0000",
        )
        self._patcher.stop()
