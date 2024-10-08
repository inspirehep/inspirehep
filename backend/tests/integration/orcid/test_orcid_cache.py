#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import mock
import pytest
from fqn_decorators.decorators import get_fqn
from helpers.factories.db.invenio_records import TestRecordMetadata
from inspirehep.orcid import cache as cache_module
from inspirehep.orcid.cache import OrcidCache, _OrcidHasher
from lxml import etree

# The tests are written in a specific order, disable random
pytestmark = pytest.mark.random_order(disabled=True)


@pytest.mark.usefixtures("inspire_app")
class TestOrcidCache:
    @pytest.fixture(autouse=True)
    def _setup(self):
        self.recid = "1936475"
        self.putcode = "myputcode"
        self.hash_value = "myhash"
        self.orcid = "0000-0002-76YY-56XX"
        self.hash_value = "sha1:acbc7dad4fd46e0deb60d6681c244a67e4be2543"
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_cache_record.json"
        )
        self.inspire_record = factory.inspire_record
        self.cache = OrcidCache(self.orcid, self.recid)

    def setup_method(self, method):
        cache_module.CACHE_PREFIX = get_fqn(method)

    def teardown(self):
        """
        Cleanup the cache after each test (as atm there is no cache isolation).
        """
        self.cache.delete_work_putcode()
        cache_module.CACHE_PREFIX = None

    def test_read_write_new_key(self):
        self.cache.write_work_putcode(self.putcode, self.inspire_record)
        putcode = self.cache.read_work_putcode()
        assert putcode == self.putcode

    def test_read_write_existent_key(self):
        self.cache.write_work_putcode(self.putcode, self.inspire_record)
        self.cache.write_work_putcode("0000", self.inspire_record)
        putcode = self.cache.read_work_putcode()
        assert putcode == "0000"

    def test_read_non_existent_key(self):
        putcode = self.cache.read_work_putcode()
        assert not putcode

    def test_has_work_content_changed_no(self):
        self.cache.write_work_putcode(self.putcode, self.inspire_record)

        cache = OrcidCache(self.orcid, self.recid)
        assert not cache.has_work_content_changed(self.inspire_record)

    def test_has_work_content_changed_yes(self):
        self.cache.write_work_putcode(self.putcode, self.inspire_record)

        self.inspire_record["titles"][0]["title"] = "mytitle"
        cache = OrcidCache(self.orcid, self.recid)
        assert cache.has_work_content_changed(self.inspire_record)

    def test_write_work_putcode_do_recompute(self):
        self.cache.write_work_putcode(self.putcode, self.inspire_record)

        self.cache.read_work_putcode()
        assert self.cache._cached_hash_value == self.hash_value

    def test_write_work_putcode_do_not_recompute(self):
        self.cache.write_work_putcode(self.putcode)

        self.cache.read_work_putcode()
        assert not self.cache._cached_hash_value

    def test_delete_work_putcode(self):
        self.cache.write_work_putcode(self.putcode, self.inspire_record)
        putcode = self.cache.read_work_putcode()
        assert putcode == self.putcode

        self.cache.delete_work_putcode()
        assert not self.cache.read_work_putcode()

    def test_delete_work_putcode_non_existing(self):
        recid = "0000"
        cache = OrcidCache(self.orcid, recid)
        cache.delete_work_putcode()
        assert not self.cache.read_work_putcode()


@pytest.mark.usefixtures("inspire_app")
class TestOrcidHasher:
    @pytest.fixture(autouse=True)
    def _setup(self):
        factory = TestRecordMetadata.create_from_file(
            __name__, "test_orcid_hasher_record.json"
        )
        self.record = factory.record_metadata
        self.hash_value = "sha1:acbc7dad4fd46e0deb60d6681c244a67e4be2543"
        self.hasher = _OrcidHasher(factory.inspire_record)

    def setup_method(self, method):
        cache_module.CACHE_PREFIX = get_fqn(method)

    def teardown(self):
        cache_module.CACHE_PREFIX = None

    def test_compute_hash(self):
        hash_value = self.hasher.compute_hash()
        assert hash_value == self.hash_value

    def test_edit_ignored_filed(self):
        self.record.json["abstracts"][0]["value"] = "xxx"
        hash_value = self.hasher.compute_hash()
        assert hash_value == self.hash_value

    def test_edit_considered_filed(self):
        self.hasher.inspire_record["titles"][0]["title"] = "xxx"
        hash_value = self.hasher.compute_hash()
        assert hash_value != self.hash_value

    def test_canonicalize_xml_element(self):
        parser = etree.XMLParser(remove_blank_text=True)

        xml_string = """
            <work:work xmlns:common="http://www.orcid.org/ns/common"
                xmlns:work="http://www.orcid.org/ns/work"
                xmlns:superfluous="http://127.0.0.1">
                <work:title>
                    <common:title><![CDATA[A <Dissertation>]]></common:title>
                </work:title>
                <work:type>dissertation</work:type>
            </work:work>
        """
        xml_parsed1 = etree.fromstring(xml_string, parser)

        xml_string = """
        <work:work xmlns:work="http://www.orcid.org/ns/work" xmlns:common="http://www.orcid.org/ns/common">
                <!-- I'm a comment, strip me -->
                <work:title>
                    <common:title>A &lt;Dissertation&gt;</common:title>
                </work:title>
                <work:type>dissertation</work:type>
            </work:work>
        """
        xml_parsed2 = etree.fromstring(xml_string, parser)

        assert _OrcidHasher(mock.Mock())._canonicalize_xml_element(
            xml_parsed1
        ) == _OrcidHasher(mock.Mock())._canonicalize_xml_element(xml_parsed2)
