# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2019 CERN.
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

import attr
from inspire_disambiguation.core.data_models.publication import PublicationCache
from inspire_disambiguation.core.helpers import get_author_affiliation, get_author_id


@attr.s(slots=True)
class Signature(object):
    """Signature data-model for estimators"""

    author_affiliation = attr.ib()
    author_id = attr.ib()
    author_name = attr.ib()
    publication = attr.ib()
    signature_block = attr.ib()
    signature_uuid = attr.ib()
    is_curated_author_id = attr.ib()

    @classmethod
    def build(cls, author, record):
        """Build Signature object from author and record dictionaries

        Args:
            author (dict): dictionary containing author data
            record (dict): dictionary containing record data

        Returns:
            Signature: Object built from provided data

        """
        author_id = get_author_id(author)
        return cls(
            **{
                "author_affiliation": get_author_affiliation(author),
                "author_id": author_id,
                "author_name": author["full_name"],
                "publication": PublicationCache.build(
                    identifier=record["control_number"], record=record
                ),
                "signature_block": author.get("signature_block"),
                "signature_uuid": author["uuid"],
                "is_curated_author_id": True
                if author_id is not None and author.get("curated_relation")
                else False,
            }
        )

    def __getitem__(self, value):
        return getattr(self, value)

    def get(self, value, default=None):
        return getattr(self, value, default)
