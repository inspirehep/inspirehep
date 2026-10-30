#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""OAI-PMH verbs tests (adapted from invenio-oaiserver)."""

from datetime import datetime, timedelta

import pytest
from freezegun import freeze_time
from helpers.utils import create_record
from inspirehep.oai.models import OAISet
from inspirehep.oai.response import NS_DC, NS_OAIDC, NS_OAIPMH
from inspirehep.oai.utils import datetime_to_datestamp
from invenio_db import db
from lxml import etree

NAMESPACES = {"x": NS_OAIPMH, "y": NS_OAIDC, "z": NS_DC}


def _get(app, query):
    with app.test_client() as client:
        return client.get(f"/api/oai2d{query}")


def _xpath(tree, path):
    return tree.xpath(path, namespaces=NAMESPACES)


def _xpath_errors(tree):
    return list(tree.iter("{*}error"))


def _check_xml_error(tree, code):
    assert len(_xpath(tree, "/x:OAI-PMH")) == 1
    error = _xpath(tree, "/x:OAI-PMH/x:error")
    assert len(error) == 1
    assert error[0].attrib["code"] == code


def _add_oai_sets(*sets):
    for oai_set in sets:
        db.session.add(oai_set)
    db.session.commit()


def test_no_verb(inspire_app):
    result = _get(inspire_app, "")
    tree = etree.fromstring(result.data)

    assert "Missing data for required field." in _xpath_errors(tree)[0].text


def test_wrong_verb(inspire_app):
    result = _get(inspire_app, "?verb=Aaa")
    tree = etree.fromstring(result.data)

    assert "This is not a valid OAI-PMH verb:Aaa" in _xpath_errors(tree)[0].text


@pytest.mark.parametrize(
    ("verb", "extra_args"),
    [
        ("GetMetadata", "&identifier=oai:inspirehep.net:1&metadataPrefix=marcxml"),
        ("__class__", ""),
        ("__init__", ""),
        ("mro", ""),
    ],
)
def test_invalid_verb_names_return_bad_verb(inspire_app, verb, extra_args):
    result = _get(inspire_app, f"?verb={verb}{extra_args}")
    assert result.status_code == 422

    tree = etree.fromstring(result.data)
    _check_xml_error(tree, code="badVerb")
    assert f"This is not a valid OAI-PMH verb:{verb}" in _xpath_errors(tree)[0].text


def test_identify(inspire_app):
    result = _get(inspire_app, "?verb=Identify")
    assert result.status_code == 200
    # no XSL transformation by default
    assert b"xml-stylesheet" not in result.data

    tree = etree.fromstring(result.data)
    config = inspire_app.config

    assert len(_xpath(tree, "/x:OAI-PMH/x:Identify")) == 1
    assert _xpath(tree, "/x:OAI-PMH/x:Identify/x:repositoryName/text()") == [
        config["OAISERVER_REPOSITORY_NAME"]
    ]
    base_url = _xpath(tree, "/x:OAI-PMH/x:Identify/x:baseURL/text()")
    assert len(base_url) == 1
    assert base_url[0].endswith("/api/oai2d")
    assert _xpath(tree, "/x:OAI-PMH/x:Identify/x:protocolVersion/text()") == [
        config["OAISERVER_PROTOCOL_VERSION"]
    ]
    assert (
        _xpath(tree, "/x:OAI-PMH/x:Identify/x:adminEmail/text()")
        == config["OAISERVER_ADMIN_EMAILS"]
    )
    assert len(_xpath(tree, "/x:OAI-PMH/x:Identify/x:earliestDatestamp")) == 1
    assert _xpath(tree, "/x:OAI-PMH/x:Identify/x:deletedRecord/text()") == ["no"]
    assert _xpath(tree, "/x:OAI-PMH/x:Identify/x:granularity/text()") == [
        config["OAISERVER_GRANULARITY"]
    ]


def test_identify_earliest_date(inspire_app):
    path = "/x:OAI-PMH/x:Identify/x:earliestDatestamp/text()"

    result = _get(inspire_app, "?verb=Identify")
    assert _xpath(etree.fromstring(result.data), path) == ["0001-01-01T00:00:00Z"]

    record = create_record("lit", data={"_export_to": {"CDS": True}})
    create_record("lit", data={"_export_to": {"CDS": True}})

    result = _get(inspire_app, "?verb=Identify")
    assert _xpath(etree.fromstring(result.data), path) == [
        datetime_to_datestamp(record.created)
    ]


def test_identify_with_xsl(inspire_app, override_config):
    with override_config(OAISERVER_XSL_URL="testdomain.com/oai2.xsl"):
        result = _get(inspire_app, "?verb=Identify")

    assert result.status_code == 200
    assert b"xml-stylesheet" in result.data


def test_identify_with_additional_args(inspire_app):
    result = _get(inspire_app, "?verb=Identify&notAValidArg=True")
    tree = etree.fromstring(result.data)

    assert _xpath_errors(tree)[0].text == "You have passed too many arguments."


def test_getrecord(inspire_app):
    record = create_record("lit", data={"_export_to": {"CDS": True}})
    prefix = inspire_app.config["OAISERVER_ID_PREFIX"]

    result = _get(
        inspire_app,
        f"?verb=GetRecord&metadataPrefix=marcxml"
        f"&identifier={prefix}{record['control_number']}",
    )
    assert result.status_code == 200

    tree = etree.fromstring(result.data)

    assert len(_xpath(tree, "/x:OAI-PMH/x:GetRecord/x:record/x:header")) == 1
    assert _xpath(
        tree, "/x:OAI-PMH/x:GetRecord/x:record/x:header/x:datestamp/text()"
    ) == [datetime_to_datestamp(record.updated)]
    assert len(_xpath(tree, "/x:OAI-PMH/x:GetRecord/x:record/x:metadata")) == 1


def test_getrecord_fail(inspire_app):
    result = _get(
        inspire_app, "?verb=GetRecord&identifier=not-exist-pid&metadataPrefix=marcxml"
    )
    assert result.status_code == 422

    _check_xml_error(etree.fromstring(result.data), code="idDoesNotExist")


def test_listmetadataformats(inspire_app):
    result = _get(inspire_app, "?verb=ListMetadataFormats")
    tree = etree.fromstring(result.data)
    metadata_formats = inspire_app.config["OAISERVER_METADATA_FORMATS"]

    prefixes = _xpath(
        tree,
        "/x:OAI-PMH/x:ListMetadataFormats/x:metadataFormat/x:metadataPrefix/text()",
    )
    schemas = _xpath(
        tree, "/x:OAI-PMH/x:ListMetadataFormats/x:metadataFormat/x:schema/text()"
    )
    namespaces = _xpath(
        tree,
        "/x:OAI-PMH/x:ListMetadataFormats/x:metadataFormat/x:metadataNamespace/text()",
    )

    assert sorted(prefixes) == sorted(metadata_formats)
    for prefix, schema, namespace in zip(prefixes, schemas, namespaces, strict=True):
        assert schema == metadata_formats[prefix]["schema"]
        assert namespace == metadata_formats[prefix]["namespace"]


def test_listmetadataformats_record_fail(inspire_app):
    result = _get(inspire_app, "?verb=ListMetadataFormats&identifier=pid-not-exists")

    _check_xml_error(etree.fromstring(result.data), code="idDoesNotExist")


def test_listsets(inspire_app):
    _add_oai_sets(OAISet(spec="test", name="Test", description="test desc"))

    result = _get(inspire_app, "?verb=ListSets")
    tree = etree.fromstring(result.data)

    assert len(_xpath(tree, "/x:OAI-PMH/x:ListSets/x:set")) == 1
    assert _xpath(tree, "/x:OAI-PMH/x:ListSets/x:set/x:setSpec/text()") == ["test"]
    assert _xpath(tree, "/x:OAI-PMH/x:ListSets/x:set/x:setName/text()") == ["Test"]
    assert _xpath(
        tree,
        "/x:OAI-PMH/x:ListSets/x:set/x:setDescription/y:dc/z:description/text()",
    ) == ["test desc"]


def test_listsets_invalid_name(inspire_app):
    _add_oai_sets(OAISet(spec="test", name="uni\x01co\x0bde", description="test"))

    result = _get(inspire_app, "?verb=ListSets")
    tree = etree.fromstring(result.data)

    assert _xpath(tree, "/x:OAI-PMH/x:ListSets/x:set/x:setName/text()") == ["unicode"]


def test_listsets_long(inspire_app):
    _add_oai_sets(
        *[
            OAISet(spec=f"test{i}", name=f"Test{i}", description=f"test desc {i}")
            for i in range(27)
        ]
    )

    expected_sets_per_page = [10, 10, 7]
    query = "?verb=ListSets"
    for page, expected_sets in enumerate(expected_sets_per_page, start=1):
        result = _get(inspire_app, query)
        tree = etree.fromstring(result.data)

        assert len(_xpath(tree, "/x:OAI-PMH/x:ListSets/x:set")) == expected_sets
        token = _xpath(tree, "/x:OAI-PMH/x:ListSets/x:resumptionToken")[0]
        if page < len(expected_sets_per_page):
            assert token.text
            query = f"?verb=ListSets&resumptionToken={token.text}"
        else:
            assert not token.text


@pytest.mark.parametrize(
    "query",
    [
        "?verb=ListRecords",
        "?verb=GetRecord&identifier=123",
        "?verb=ListIdentifiers",
        "?verb=ListRecords&metadataPrefix=not-exist",
        "?verb=GetRecord&identifier=123&metadataPrefix=not-exist",
        "?verb=ListIdentifiers&metadataPrefix=not-exist",
    ],
)
def test_missing_or_not_existing_metadata_prefix(inspire_app, query):
    result = _get(inspire_app, query)

    _check_xml_error(etree.fromstring(result.data), code="badArgument")


def test_listrecords(inspire_app, override_config):
    records = [
        create_record("lit", data={"_export_to": {"CDS": True}}) for _ in range(3)
    ]

    with override_config(OAISERVER_PAGE_SIZE=2):
        result = _get(inspire_app, "?verb=ListRecords&metadataPrefix=marcxml")
        tree = etree.fromstring(result.data)

        assert len(_xpath(tree, "/x:OAI-PMH/x:ListRecords/x:record")) == 2
        assert len(_xpath(tree, "/x:OAI-PMH/x:ListRecords/x:record/x:metadata")) == 2
        token = _xpath(tree, "/x:OAI-PMH/x:ListRecords/x:resumptionToken")[0]
        assert token.text
        assert token.attrib["completeListSize"] == "3"
        assert token.attrib["cursor"] == "0"

        result = _get(inspire_app, f"?verb=ListRecords&resumptionToken={token.text}")
        tree = etree.fromstring(result.data)

        assert len(_xpath(tree, "/x:OAI-PMH/x:ListRecords/x:record")) == 1
        token = _xpath(tree, "/x:OAI-PMH/x:ListRecords/x:resumptionToken")[0]
        assert not token.text
        assert token.attrib["cursor"] == "2"

        # Check from:until range with date and datetime granularity.
        updated = records[-1].updated
        for day_granularity in (False, True):
            from_ = datetime_to_datestamp(
                updated - timedelta(days=1), day_granularity=day_granularity
            )
            until = datetime_to_datestamp(
                updated + timedelta(days=1), day_granularity=day_granularity
            )
            result = _get(
                inspire_app,
                f"?verb=ListRecords&metadataPrefix=marcxml&from={from_}&until={until}",
            )
            assert result.status_code == 200

            tree = etree.fromstring(result.data)
            assert len(_xpath(tree, "/x:OAI-PMH/x:ListRecords/x:record")) == 2


def test_listidentifiers_with_set(inspire_app):
    cds_record = create_record("lit", data={"_export_to": {"CDS": True}})
    create_record("lit")
    set_name = inspire_app.config["OAI_SET_CDS"]
    prefix = inspire_app.config["OAISERVER_ID_PREFIX"]

    result = _get(
        inspire_app, f"?verb=ListIdentifiers&metadataPrefix=marcxml&set={set_name}"
    )
    tree = etree.fromstring(result.data)

    assert _xpath(
        tree, "/x:OAI-PMH/x:ListIdentifiers/x:header/x:identifier/text()"
    ) == [f"{prefix}{cds_record['control_number']}"]
    assert _xpath(tree, "/x:OAI-PMH/x:ListIdentifiers/x:header/x:datestamp/text()") == [
        datetime_to_datestamp(cds_record.updated)
    ]
    assert len(_xpath(tree, "/x:OAI-PMH/x:ListIdentifiers/x:resumptionToken")) == 0


def test_listidentifiers(inspire_app, override_config):
    records = [
        create_record("lit", data={"_export_to": {"CDS": True}}) for _ in range(3)
    ]
    set_name = inspire_app.config["OAI_SET_CDS"]

    with override_config(OAISERVER_PAGE_SIZE=2):
        result = _get(inspire_app, "?verb=ListIdentifiers&metadataPrefix=marcxml")
        tree = etree.fromstring(result.data)

        assert len(_xpath(tree, "/x:OAI-PMH/x:ListIdentifiers/x:header")) == 2
        token = _xpath(tree, "/x:OAI-PMH/x:ListIdentifiers/x:resumptionToken")[0]
        assert token.text
        assert token.attrib["completeListSize"] == "3"

        result = _get(
            inspire_app, f"?verb=ListIdentifiers&resumptionToken={token.text}"
        )
        tree = etree.fromstring(result.data)

        assert len(_xpath(tree, "/x:OAI-PMH/x:ListIdentifiers/x:header")) == 1
        token = _xpath(tree, "/x:OAI-PMH/x:ListIdentifiers/x:resumptionToken")[0]
        assert not token.text

    # Check from:until range with date and datetime granularity.
    updated = records[-1].updated
    for day_granularity in (False, True):
        from_ = datetime_to_datestamp(
            updated - timedelta(days=1), day_granularity=day_granularity
        )
        until = datetime_to_datestamp(
            updated + timedelta(days=1), day_granularity=day_granularity
        )
        result = _get(
            inspire_app,
            f"?verb=ListIdentifiers&metadataPrefix=marcxml"
            f"&from={from_}&until={until}&set={set_name}",
        )
        assert result.status_code == 200

        tree = etree.fromstring(result.data)
        assert len(_xpath(tree, "/x:OAI-PMH/x:ListIdentifiers/x:header")) == 3


def _get_list_identifiers_token(inspire_app, override_config):
    for _ in range(3):
        create_record("lit", data={"_export_to": {"CDS": True}})

    with override_config(OAISERVER_PAGE_SIZE=2):
        result = _get(inspire_app, "?verb=ListIdentifiers&metadataPrefix=marcxml")

    tree = etree.fromstring(result.data)
    return _xpath(tree, "/x:OAI-PMH/x:ListIdentifiers/x:resumptionToken")[0].text


@pytest.mark.parametrize("extra_args", ["&metadataPrefix=marcxml", "&set=ForCDS"])
def test_resumption_token_with_other_args(inspire_app, override_config, extra_args):
    token = _get_list_identifiers_token(inspire_app, override_config)

    result = _get(
        inspire_app, f"?verb=ListIdentifiers&resumptionToken={token}{extra_args}"
    )
    assert result.status_code == 422

    tree = etree.fromstring(result.data)
    errors = _xpath(tree, "/x:OAI-PMH/x:error")

    # The extra "_schema" error is a quirk inherited from invenio-oaiserver,
    # kept so harvesters get the same response as before.
    assert [error.attrib["code"] for error in errors] == ["badArgument"] * 2
    assert [error.text for error in errors] == [
        "_schema",
        "You have passed too many arguments.",
    ]


def test_invalid_resumption_token(inspire_app):
    result = _get(inspire_app, "?verb=ListRecords&resumptionToken=not-a-token")
    assert result.status_code == 422

    _check_xml_error(etree.fromstring(result.data), code="badResumptionToken")


def test_expired_resumption_token(inspire_app, override_config):
    expire_time = inspire_app.config["OAISERVER_RESUMPTION_TOKEN_EXPIRE_TIME"]

    with freeze_time(datetime.utcnow()) as frozen_time:
        token = _get_list_identifiers_token(inspire_app, override_config)
        frozen_time.tick(timedelta(seconds=expire_time + 1))

        result = _get(inspire_app, f"?verb=ListIdentifiers&resumptionToken={token}")

    assert result.status_code == 422
    _check_xml_error(etree.fromstring(result.data), code="badResumptionToken")
