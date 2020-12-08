# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from marshmallow import Schema, fields

from inspirehep.records.marshmallow.literature.common import (
    ExternalSystemIdentifierSchemaV1,
)


def test_all_schema_types_except_kekscan():
    class TestSchema(Schema):
        external_system_identifiers = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
        )

    schema = TestSchema()
    dump = {
        "external_system_identifiers": [
            {"schema": "ads", "value": "ads-id"},
            {"schema": "CDS", "value": "cds-id"},
            {"schema": "euclid", "value": "euclid-id"},
            {"schema": "hal", "value": "hal-id"},
            {"schema": "MSNET", "value": "msnet-id"},
            {"schema": "osti", "value": "osti-id"},
            {"schema": "zblatt", "value": "zblatt-id"},
        ]
    }
    expected = {
        "external_system_identifiers": [
            {
                "url_link": "https://ui.adsabs.harvard.edu/abs/ads-id",
                "url_name": "ADS Abstract Service",
            },
            {
                "url_link": "http://cds.cern.ch/record/cds-id",
                "url_name": "CERN Document Server",
            },
            {
                "url_link": "http://projecteuclid.org/euclid-id",
                "url_name": "Project Euclid",
            },
            {
                "url_link": "https://hal.archives-ouvertes.fr/hal-id",
                "url_name": "HAL Archives Ouvertes",
            },
            {
                "url_link": "http://www.ams.org/mathscinet-getitem?mr=msnet-id",
                "url_name": "AMS MathSciNet",
            },
            {
                "url_link": "https://www.osti.gov/scitech/biblio/osti-id",
                "url_name": "OSTI Information Bridge Server",
            },
            {
                "url_link": "http://www.zentralblatt-math.org/zmath/en/search/?an=zblatt-id",  # noqa
                "url_name": "zbMATH",
            },
        ]
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_takes_first_id_foreach_url_name():
    class TestSchema(Schema):
        external_system_identifiers = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
        )

    schema = TestSchema()
    dump = {
        "external_system_identifiers": [
            {"schema": "ads", "value": "ads-id-1"},
            {"schema": "ADS", "value": "ads-id-2"},
        ]
    }
    expected = {
        "external_system_identifiers": [
            {
                "url_link": "https://ui.adsabs.harvard.edu/abs/ads-id-1",
                "url_name": "ADS Abstract Service",
            }
        ]
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_takes_ids_that_have_configured_url():
    class TestSchema(Schema):
        external_system_identifiers = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
        )

    schema = TestSchema()
    dump = {
        "external_system_identifiers": [
            {"schema": "ADS", "value": "ads-id"},
            {"schema": "WHATEVER", "value": "whatever-id"},
        ]
    }
    expected = {
        "external_system_identifiers": [
            {
                "url_link": "https://ui.adsabs.harvard.edu/abs/ads-id",
                "url_name": "ADS Abstract Service",
            }
        ]
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_kekscan_with_9_chars_value():
    class TestSchema(Schema):
        external_system_identifiers = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
        )

    schema = TestSchema()
    dump = {
        "external_system_identifiers": [{"schema": "KEKSCAN", "value": "200727065"}]
    }
    expected = {
        "external_system_identifiers": [
            {
                "url_link": "https://lib-extopc.kek.jp/preprints/PDF/2007/0727/0727065.pdf",  # noqa
                "url_name": "KEK scanned document",
            }
        ]
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_kekscan_with_dashes():
    class TestSchema(Schema):
        external_system_identifiers = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
        )

    schema = TestSchema()
    dump = {
        "external_system_identifiers": [{"schema": "KEKSCAN", "value": "2007-27-065"}]
    }
    expected = {
        "external_system_identifiers": [
            {
                "url_link": "https://lib-extopc.kek.jp/preprints/PDF/2007/0727/0727065.pdf",  # noqa
                "url_name": "KEK scanned document",
            }
        ]
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_kekscan_with_7_chars_value_that_does_not_start_with_19_and_20():
    class TestSchema(Schema):
        external_system_identifiers = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
        )

    schema = TestSchema()
    dump = {"external_system_identifiers": [{"schema": "KEKSCAN", "value": "9327065"}]}
    expected = {
        "external_system_identifiers": [
            {
                "url_link": "https://lib-extopc.kek.jp/preprints/PDF/1993/9327/9327065.pdf",  # noqa
                "url_name": "KEK scanned document",
            }
        ]
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_kekscan_with_not_9_or_7_chars_is_ignored():
    class TestSchema(Schema):
        external_system_identifiers = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
        )

    schema = TestSchema()
    dump = {
        "external_system_identifiers": [{"schema": "KEKSCAN", "value": "12345678910"}]
    }
    expected = {"external_system_identifiers": []}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_works_without_many_is_true():
    class TestSchema(Schema):
        external_system_identifier = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True
        )

    schema = TestSchema()
    dump = {"external_system_identifier": {"schema": "ADS", "value": "ads-id"}}

    expected = {
        "external_system_identifier": {
            "url_link": "https://ui.adsabs.harvard.edu/abs/ads-id",
            "url_name": "ADS Abstract Service",
        }
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def test_returns_empty_without_many_is_true_if_does_not_have_configured_url():
    class TestSchema(Schema):
        external_system_identifier = fields.Nested(
            ExternalSystemIdentifierSchemaV1, dump_only=True
        )

    schema = TestSchema()
    dump = {
        "external_system_identifier": {"schema": "WHATEVER", "value": "whatever-id"}
    }

    expected = {"external_system_identifier": {}}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
