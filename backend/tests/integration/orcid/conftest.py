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


import pytest

IS_VCR_ENABLED = True
IS_VCR_EPISODE_OR_ERROR = False  # False to record new cassettes.


@pytest.fixture(scope="session")
def vcr_config():
    record_mode = "none" if IS_VCR_EPISODE_OR_ERROR else "new_episodes"

    if not IS_VCR_ENABLED:
        # Trick to disable VCR.
        return {"before_record": lambda *args, **kwargs: None}

    return {
        "decode_compressed_response": True,
        "filter_headers": ("Authorization", "User-Agent"),
        "ignore_hosts": (
            "localhost",
            "elasticsearch",
            "postgres",
            "redis",
            "indexer",
            "cache",
            "db",
            "mq",
            "hep-worker",
            "hep-web",
            "ui",
            "next-web",
            "next-worker",
            "flower",
        ),
        "record_mode": record_mode,
    }


@pytest.fixture
def vcr(vcr):
    vcr.register_matcher(
        "accept", lambda r1, r2: r1.headers.get("Accept") == r2.headers.get("Accept")
    )
    vcr.match_on = [
        "method",
        "scheme",
        "host",
        "port",
        "path",
        "query",
        "accept",
        "body",
    ]
    return vcr


# NOTE: a desired side effect of this auto-used fixtures is that VCR is used
# in all tests, no need to mark them with: @pytest.mark.vcr()
# This effect is desired to avoid any network interaction apart from those
# to the listed in vcr_config > ignore_hosts.
@pytest.fixture(autouse=True)
def _assert_all_played(request, vcr_cassette):
    """
    Ensure that all all episodes have been played in the current test.
    Only if the current test has a cassette.
    """
    return
