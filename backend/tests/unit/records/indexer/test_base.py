#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from inspirehep.indexer.base import InspireRecordIndexer
from inspirehep.records.api.literature import LiteratureRecord


@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_referenced_authors_bais",
    return_value=[],
)
@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_bibtex_display",
    return_value="",
)
@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_latex_eu_display",
    return_value="",
)
@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_latex_us_display",
    return_value="",
)
@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureElasticSearchSchema.get_cv_format",
    return_value="",
)
@mock.patch(
    "inspirehep.records.api.mixins.CitationMixin.citation_count_without_self_citations",
    return_value="",
)
@mock.patch(
    "inspirehep.records.api.mixins.CitationMixin.citation_count", return_value=""
)
@mock.patch("flask_sqlalchemy._QueryProperty.__get__")
@mock.patch("inspirehep.indexer.base.before_record_index")
@mock.patch("inspirehep.indexer.base.current_app")
@mock.patch("inspirehep.records.api.base.RecordMetadata")
@mock.patch("inspirehep.records.marshmallow.literature.ui.current_app")
def test_indexer_prepare_record(
    current_app_mock_ui,
    record_metadata_mock,
    current_app_mock,
    receiver_mock,
    query_mock,
    mock_citations,
    mock_citations_without_self_citations,
    mock_latex_us_display,
    mock_latex_eu_display,
    mock_bibtex_display,
    mock_referenced_authors,
    mock_cv_format,
):
    query_mock.return_value.filter_by.return_value.count.return_value = 1
    query_mock.return_value.filter_by.return_value.filter.return_value.count.return_value = 1
    record = LiteratureRecord({})
    indexer = InspireRecordIndexer()
    # Assume that record methods was already tested
    expected = record.serialize_for_es()

    processed = indexer._prepare_record(record, "index_name", "document_type")
    assert receiver_mock.send.call_count == 1
    assert expected == processed


@mock.patch("invenio_indexer.api.build_alias_name", return_value="prefixed-index")
@mock.patch("inspirehep.indexer.base.current_app")
@mock.patch(
    "inspirehep.indexer.base.InspireRecordIndexer._prepare_record", return_value={}
)
@mock.patch(
    "inspirehep.indexer.base.InspireRecordIndexer.record_to_index",
    return_value=(None, None),
)
def test_process_bulk_record_for_index(
    record_to_index_mock, prepare_record_mock, mock_config, build_alias_mocked
):
    record = LiteratureRecord({})
    indexer = InspireRecordIndexer()
    expected_data = {
        "_op_type": "index",
        "_index": "prefixed-index",
        "_type": "document_type",
        "_id": str(record.id),
        "_version": record.revision_id,
        "_version_type": "version_type",
        "_source": {},
    }

    bulk_data = indexer._process_bulk_record_for_index(
        record, "version_type", "index_name", "document_type"
    )
    # we pop pipeline cause flask app is mocked
    bulk_data.pop("pipeline")

    assert record_to_index_mock.call_count == 1
    assert prepare_record_mock.call_count == 1
    assert expected_data == bulk_data


@mock.patch("invenio_indexer.api.build_alias_name", return_value="prefixed-index")
@mock.patch("inspirehep.indexer.base.current_app")
@mock.patch(
    "inspirehep.indexer.base.InspireRecordIndexer._prepare_record", return_value={}
)
@mock.patch(
    "inspirehep.indexer.base.InspireRecordIndexer.record_to_index",
    return_value="test_index",
)
def test_process_bulk_record_for_index_default_values(
    record_to_index_mock, prepare_record_mock, mock_current_app, build_alias_mocked
):
    record = LiteratureRecord({})
    indexer = InspireRecordIndexer()
    expected_data = {
        "_op_type": "index",
        "_index": "prefixed-index",
        "_type": None,
        "_id": str(record.id),
        "_version": record.revision_id,
        "_version_type": "external_gte",
        "_source": {},
    }

    bulk_data = indexer._process_bulk_record_for_index(record)
    # we pop pipeline cause flask app is mocked
    bulk_data.pop("pipeline")

    assert record_to_index_mock.call_count == 1
    assert prepare_record_mock.call_count == 1
    assert expected_data == bulk_data


@mock.patch("inspirehep.records.api.base.InspireRecord.get_record")
def test_bulk_action_catches_recursion_error_in_deleted_records(mock_get_record):
    record = LiteratureRecord({})
    record["deleted"] = True
    record.index = mock.Mock(side_effect=RecursionError("max recursion exceeded"))
    mock_get_record.return_value = record

    indexer = InspireRecordIndexer()
    result = indexer.bulk_action(record.id)
    assert result is None
