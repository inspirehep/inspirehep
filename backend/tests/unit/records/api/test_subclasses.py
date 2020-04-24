# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.api import (
    AuthorsRecord,
    ConferencesRecord,
    DataRecord,
    ExperimentsRecord,
    InstitutionsRecord,
    JobsRecord,
    JournalsRecord,
    LiteratureRecord,
)


def test_subclasses_for_institutions():
    expected = {"ins": InstitutionsRecord}
    assert expected == InstitutionsRecord.get_subclasses()


def test_subclasses_for_jobs():
    expected = {"job": JobsRecord}
    assert expected == JobsRecord.get_subclasses()


def test_subclasses_for_literature():
    expected = {"lit": LiteratureRecord}
    assert expected == LiteratureRecord.get_subclasses()


def test_subclasses_for_authors():
    expected = {"aut": AuthorsRecord}
    assert expected == AuthorsRecord.get_subclasses()


def test_subclasses_for_data():
    expected = {"dat": DataRecord}
    assert expected == DataRecord.get_subclasses()


def test_subclasses_for_experiments():
    expected = {"exp": ExperimentsRecord}
    assert expected == ExperimentsRecord.get_subclasses()


def test_subclasses_for_journals():
    expected = {"jou": JournalsRecord}
    assert expected == JournalsRecord.get_subclasses()


def test_subclasses_for_conferences():
    expected = {"con": ConferencesRecord}
    assert expected == ConferencesRecord.get_subclasses()
