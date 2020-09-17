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
from inspire_disambiguation.core.helpers import CachedObject, get_authors_full_names
from inspire_schemas.readers import LiteratureReader


@attr.s(slots=True)
class Publication(object):
    """Publication data-model for estimators"""

    abstract = attr.ib()
    authors = attr.ib()
    collaborations = attr.ib()
    keywords = attr.ib()
    publication_id = attr.ib()
    title = attr.ib()
    topics = attr.ib()

    @classmethod
    def build(cls, record):
        """Build Publication object from record dictionary

        Args:
            record (dict): dictionary containing record data

        Returns:
            Publication: Object built from provided data

        """
        reader = LiteratureReader(record)
        return cls(
            **{
                "abstract": reader.abstract,
                "authors": get_authors_full_names(record),
                "collaborations": reader.collaborations,
                "keywords": reader.keywords,
                "publication_id": record["control_number"],
                "title": reader.title,
                "topics": reader.inspire_categories,
            }
        )

    def __getitem__(self, value):
        return getattr(self, value)

    def get(self, value, default=None):
        return getattr(self, value, default)


class PublicationCache(CachedObject):
    object_factory = Publication.build
