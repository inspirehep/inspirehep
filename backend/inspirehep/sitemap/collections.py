# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch_dsl.query import Q

from inspirehep.search.api import (
    AuthorsSearch,
    ConferencesSearch,
    JobsSearch,
    LiteratureSearch,
    SeminarsSearch,
)


def jobs():
    only_open = Q("term", status="open")
    return JobsSearch().query(only_open)


def literature():
    return LiteratureSearch()


def authors():
    return AuthorsSearch()


def conferences():
    return ConferencesSearch()


def seminars():
    return SeminarsSearch()


def get_indexable_record_searches():
    return [jobs(), literature(), authors(), conferences(), seminars()]
