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

"""Disambiguation helpers."""
import numpy
from beard.utils import given_name, given_name_initial, normalize_name
from inspire_utils.helpers import maybe_int
from inspire_utils.record import get_value


def load_signatures(signatures):
    """Groups signatures by signature_uuid.

    Args:
        signatures (list): List of signatures to be grouped.

    Returns:
        dict : signatures grouped by signature_uuid.

    """
    signatures_by_uuid = {}
    for signature in signatures:
        signatures_by_uuid[signature["signature_uuid"]] = signature

    return signatures_by_uuid


def get_author_full_name(signature):
    """Get author_name normalized.

    Args:
        signature (Signature): Signature object

    Returns:
        str: Normalized `signature.author_name` or empty string if None

    """
    return normalize_name(signature.author_name)


def get_first_initial(signature):
    """Get first initial of author's name.

    Args:
        signature (Signature): Signature object

    Returns:
        str: First initial of author_name

    """
    try:
        return given_name_initial(signature.author_name, 0)
    except IndexError:
        return ""


def get_second_initial(signature):
    """Get second initial of author's name.

    Args:
        signature (Signature): Signature object

    Returns:
        str: Second initial of author_name

    """
    try:
        return given_name_initial(signature.author_name, 1)
    except IndexError:
        return ""


def get_first_given_name(signature):
    """Get first given name of author

    Args:
        signature (Signature): Signature object

    Returns:
        str: First given name of author

    """
    return given_name(signature.author_name, 0)


def get_second_given_name(signature):
    """Get second given name from author_name.

    Args:
        signature (Signature): Signature object

    Returns:
        str: Second given name of author

    """
    return given_name(signature.author_name, 1)


def get_author_other_names(signature):
    """Get other names of author normalized.

    Args:
        signature (Signature): Signature object

    Returns:
        str: Normalized other names of author

    """
    author_name = signature.author_name
    other_names = author_name.split(",", 1)
    return normalize_name(other_names[1]) if len(other_names) == 2 else ""


def get_normalized_affiliation(signature):
    """Get author_affiliations normalized.

    Args:
        signature (Signature): Signature object

    Returns:
        str: Normalized `signature.author_affiliation` or empty string if None

    """
    author_affiliation = signature.author_affiliation
    return normalize_name(author_affiliation) if author_affiliation else ""


def get_coauthors_neighborhood(signature, radius=10):
    authors = signature.publication.get("authors", [])
    try:
        center = authors.index(signature.author_name)
        return " ".join(
            authors[max(0, center - radius): min(len(authors), center + radius)]
        )
    except ValueError:
        return " ".join(authors)


def get_abstract(signature):
    """Get publication.abstract from signature object.

        Args:
            signature (Signature): signature: Signature object

        Returns:
            str: "publication.abstract" from signature.publication object.
        """
    return signature.publication.abstract


def get_keywords(signature):
    """Get `publication.keywords` from signature object in one string
            separated with space.

        Args:
            signature (Signature): signature: Signature object

        Returns:
            str: `publication.keywords` from signature object in one string
                separated with space.
        """
    return " ".join(signature.publication.keywords)


def get_collaborations(signature):
    """Get `publication.collaborations` from signature object in one string
        separated with space.

    Args:
        signature (Signature): signature: Signature object

    Returns:
        str: `publication.collaborations` from signature object in one string
            separated with space.
    """
    return " ".join(signature.publication.collaborations)


def get_topics(signature):
    """Get `publication.topics` from signature object in one string separated with space.

    Args:
        signature (Signature): signature: Signature object

    Returns:
        str: `publication.topics` from signature object
            in one string separated with space.

    """
    return " ".join(signature.publication.topics)


def get_title(signature):
    """Get `publication.title` from signature object.

    Args:
        signature (Signature): Signature object

    Returns:
        str: Publication title.
    """
    return signature.publication.title


def group_by_signature(signatures):
    """Get signature_uuid of first signature on the list.

    Args:
        signatures (list): List of signature objects.

    Returns:
        str: signature_uuid of the first signature.

    """
    return signatures[0].signature_uuid


def get_author_affiliation(author):
    """Returns list of affiliations from author data.

    Args:
        author (dict): ES literature record data for author.

    Returns:
        list: list of every `value[0]` from `author.affiliations` key.
    """
    return get_value(author, "affiliations.value[0]", default="")


def get_author_id(author):
    """Returns recid for author $ref entry.
    Args:
        author (dict): ES literature record data for author.

    Returns:
        int: `recid` of author.
    """
    return get_recid_from_ref(author.get("record"))


def get_recid_from_ref(ref_obj):
    """Retrieve recid from jsonref reference object.
    If no recid can be parsed, returns None.
    """
    if not isinstance(ref_obj, dict):
        return None
    url = ref_obj.get("$ref", "")
    return maybe_int(url.split("/")[-1])


def get_authors_full_names(record):
    """Extracts authors names form ES literature record data.

    Args:
        record (dict): LiteratureRecord data.

    Returns:
        list: List of every `author.full_name` from `author.authors` key.
    """
    return get_value(record, "authors.full_name", default=[])


def process_clustering_output(clusterer):
    """Process output of `Clusterer.fit` function to meet requirements of inspire.
    Args:
        clusterer (Clusterer): Clusterer object with all data processed by fit function.

    Returns:
        list: list with dicts
        Examples:
            [
              {"signatures" : [(recid, sig_uuid)], "authors": [(author_id, has_claims)]}
              ...,
            ]

    """
    labels = clusterer.clusterer.labels_
    output = []
    for label in numpy.unique(labels):
        signatures = clusterer.X[labels == label]
        author_id_to_is_curated = {}
        signatures_output = []
        for sig in signatures:
            author_id = sig[0]["author_id"]
            if sig[0]["is_curated_author_id"]:
                author_id_to_is_curated[author_id] = True
            elif author_id and author_id not in author_id_to_is_curated:
                author_id_to_is_curated[author_id] = False

            signatures_output.append(
                {
                    "publication_id": sig[0].publication["publication_id"],
                    "signature_uuid": sig[0]["signature_uuid"],
                }
            )
        authors_output = [
            {"author_id": author_id, "has_claims": author_id_to_is_curated[author_id]}
            for author_id in author_id_to_is_curated
        ]
        output.append({"signatures": signatures_output, "authors": authors_output})
    return output


class CachedObject(object):
    """Simple helper to cache objects"""

    cache = {}
    object_factory = None

    @classmethod
    def build(cls, identifier, **kwargs):
        """Return object from cache, building it if it's not there.
        Object which will be cached must have some kind of factory.

        Args:
            identifier: Some unique key for the object.
            **kwargs: Data passed to builder of the object if it's not in cache.

        Returns: Instance of requested object
        Example:
            >>> class SomeClass(object):
                    @classmethod
                    def factory(**kwargs):
                        (...) # builds object
                        return instance
            >>> class SomeClassCached(CachedObject):
                    _object_factory = SomeClass.factory
            >>> obj = SomeClassCached.get(1, {'data': 'xyz'})
        """
        if identifier not in cls.cache:
            cls.cache[identifier] = cls.object_factory(**kwargs)
        return cls.cache[identifier]

    @classmethod
    def clear(cls):
        """Clears cache for the object.
        """
        cls.cache = {}
