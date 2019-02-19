# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

from __future__ import absolute_import, division, print_function

import random

import factory
import pytest
from helpers.factories.models.base import BaseFactory
from helpers.providers.faker import faker
from invenio_records.models import RecordMetadata


class RecordMetadataFactory(BaseFactory):
    class Meta:
        model = RecordMetadata

    class Params:
        record_type = "lit"

    @classmethod
    def _adjust_kwargs(cls, **kwargs):
        data = kwargs.pop("data", None)
        control_number = kwargs.pop("control_number", None)

        if data:
            kwargs["json"].update(data)

        if control_number and "control_number" not in kwargs["json"]:
            kwargs["json"].update({"control_number": control_number})
        return kwargs

    json = factory.LazyAttribute(lambda o: faker.record(o.record_type))
