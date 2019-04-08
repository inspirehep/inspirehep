# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

import pkg_resources

from inspirehep.migrator.tasks import read_file


def test_read_file_reads_xml_file_correctly():
    xml_file = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1663924.xml")
    )

    with open(xml_file, "rb") as f:
        expected = f.readlines()
    result = list(read_file(xml_file))

    assert expected == result


def test_read_file_reads_gzipped_file_correctly():
    xml_file = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1663924.xml")
    )
    gzipped_file = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1663924.xml.gz")
    )

    with open(xml_file, "rb") as f:
        expected = f.readlines()
    result = list(read_file(gzipped_file))

    assert expected == result


def test_read_file_reads_prodsync_file_correctly():
    xml_files = [
        pkg_resources.resource_filename(
            __name__, os.path.join("fixtures", "1663923.xml")
        ),
        pkg_resources.resource_filename(
            __name__, os.path.join("fixtures", "1663924.xml")
        ),
    ]

    prodsync_file = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "micro-prodsync.tar")
    )

    expected = []
    for xml_file in xml_files:
        with open(xml_file, "rb") as f:
            expected.extend(f.readlines())
    result = list(read_file(prodsync_file))

    assert expected == result
