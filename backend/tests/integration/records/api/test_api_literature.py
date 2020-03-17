# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import datetime
import json
from uuid import UUID, uuid4

import mock
import pytest
import requests_mock
from freezegun import freeze_time
from helpers.providers.faker import faker
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError

from inspirehep.files.api import current_s3_instance
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.api.literature import import_article
from inspirehep.records.errors import ExistingArticleError, UnknownImportIdentifierError
from inspirehep.records.models import RecordCitations


def test_literature_create(base_app, db, es):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_literature_create_does_not_mint_if_record_is_deleted(base_app, db, es):
    data = faker.record("lit", data={"deleted": True}, with_control_number=True)
    record = LiteratureRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one_or_none()

    assert record_pid == None


def test_literature_create_with_mutliple_pids(base_app, db, create_pidstore):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)

    expected_pids_len = 3
    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record = LiteratureRecord.create(data)

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    record_total_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id
    ).count()

    assert expected_pids_len == record_total_pids
    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value


def test_literature_create_with_mutliple_updated_pids(base_app, db, create_pidstore):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)

    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record = LiteratureRecord.create(data)

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value

    doi_value_new = faker.doi()
    arxiv_value_new = faker.arxiv()
    data.update(
        {
            "control_number": record["control_number"],
            "arxiv_eprints": [{"value": arxiv_value_new}],
            "dois": [{"value": doi_value_new}],
        }
    )

    record.update(data)

    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value_new
    expected_pid_doi_value = doi_value_new

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value


def test_literature_on_delete(base_app, db, es_clear):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", data=data, with_control_number=True)

    record = LiteratureRecord.create(data)

    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value

    record.delete()
    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(
        pid_type="arxiv"
    ).one_or_none()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one_or_none()

    assert None == record_arxiv_pid
    assert None == record_doi_pid
    assert PIDStatus.DELETED == record_lit_pid.status


def test_literature_on_delete_through_metadata_update(base_app, db, es_clear):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", data=data, with_control_number=True)

    record = LiteratureRecord.create(data)

    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value

    record["deleted"] = True
    record.update(dict(record))
    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(
        pid_type="arxiv"
    ).one_or_none()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one_or_none()

    assert None == record_arxiv_pid
    assert None == record_doi_pid
    assert PIDStatus.DELETED == record_lit_pid.status


def test_literature_create_with_existing_control_number(
    base_app, db, es, create_pidstore
):
    data = faker.record("lit", with_control_number=True)
    existing_object_uuid = uuid4()

    create_pidstore(
        object_uuid=existing_object_uuid,
        pid_type="lit",
        pid_value=data["control_number"],
    )

    with pytest.raises(PIDAlreadyExists):
        LiteratureRecord.create(data)


def test_literature_create_with_arxiv_eprints(base_app, db, es):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    expected_arxiv_pid_value = arxiv_value
    expected_arxiv_pid_type = "arxiv"
    expected_arxiv_pid_provider = "external"

    record_pid_arxiv = PersistentIdentifier.query.filter_by(
        pid_type="arxiv", object_uuid=record.id
    ).one()

    assert record.model.id == record_pid_arxiv.object_uuid
    assert expected_arxiv_pid_value == record_pid_arxiv.pid_value
    assert expected_arxiv_pid_type == record_pid_arxiv.pid_type
    assert expected_arxiv_pid_provider == record_pid_arxiv.pid_provider


def test_literature_create_with_dois(base_app, db, es):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    expected_doi_pid_value = doi_value
    expected_doi_pid_type = "doi"
    expected_doi_pid_provider = "external"
    record_pid_doi = PersistentIdentifier.query.filter_by(
        pid_type="doi", object_uuid=record.id
    ).one()

    assert record.model.id == record_pid_doi.object_uuid
    assert expected_doi_pid_value == record_pid_doi.pid_value
    assert expected_doi_pid_type == record_pid_doi.pid_type
    assert expected_doi_pid_provider == record_pid_doi.pid_provider


def test_literature_create_with_invalid_data(base_app, db, create_pidstore):
    data = faker.record("lit", with_control_number=True)
    data["invalid_key"] = "should throw an error"
    record_control_number = str(data["control_number"])

    with pytest.raises(ValidationError):
        LiteratureRecord.create(data)

    record_pid = PersistentIdentifier.query.filter_by(
        pid_value=record_control_number
    ).one_or_none()
    assert record_pid is None


def test_literature_create_with_invalid_data_and_mutliple_pids(
    base_app, db, create_pidstore
):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    data["invalid_key"] = "should throw an error"
    pid_lit_value = str(data["control_number"])
    pid_arxiv_value = arxiv_value
    pid_doi_value = doi_value

    with pytest.raises(ValidationError):
        LiteratureRecord.create(data)

    record_lit_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_lit_value
    ).one_or_none()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_arxiv_value
    ).one_or_none()
    record_doi_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_doi_value
    ).one_or_none()

    assert record_lit_pid is None
    assert record_arxiv_pid is None
    assert record_doi_pid is None


def test_literature_update(base_app, db, es):
    data = faker.record("lit", with_control_number=True)
    record = LiteratureRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data.update({"titles": [{"title": "UPDATED"}]})
    record.update(data)
    control_number = str(record["control_number"])
    record_updated_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_literature_create_or_update_with_new_record(base_app, db, es):
    data = faker.record("lit")
    record = LiteratureRecord.create_or_update(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_literature_create_or_update_with_existing_record(base_app, db, es):
    data = faker.record("lit", with_control_number=True)
    record = LiteratureRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data.update({"titles": [{"title": "UPDATED"}]})

    record_updated = LiteratureRecord.create_or_update(data)
    control_number = str(record_updated["control_number"])

    assert record["control_number"] == record_updated["control_number"]

    record_updated_db = RecordMetadata.query.filter_by(id=record_updated.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record_updated.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_subclasses_for_literature(base_app, db, es):
    expected = {"lit": LiteratureRecord}
    assert expected == LiteratureRecord.get_subclasses()


def test_get_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("lit")
    record = InspireRecord.create(data)
    record_from_db = InspireRecord.get_record(record.id)
    assert type(record_from_db) == LiteratureRecord


def test_dump_for_es(base_app, db, es):
    additional_fields = {
        "preprint_date": "2016-01-01",
        "publication_info": [{"year": 2015}],
    }
    data = faker.record("lit", data=additional_fields)
    expected_document_type = ["article"]
    record = LiteratureRecord.create(data)
    dump = record.serialize_for_es()

    assert "_ui_display" in dump
    assert "_latex_us_display" in dump
    assert "_latex_eu_display" in dump
    assert "_bibtex_display" in dump
    assert "control_number" in dump
    assert record["control_number"] == dump["control_number"]
    assert "id" in dump
    assert record["control_number"] == dump["id"]
    assert expected_document_type == dump["document_type"]

    ui_field = json.loads(dump["_ui_display"])
    assert "titles" in ui_field
    assert "document_type" in ui_field
    assert record["titles"] == ui_field["titles"]
    assert record["control_number"] == ui_field["control_number"]


@freeze_time("1994-12-19")
def test_dump_for_es_adds_latex_and_bibtex_displays(base_app, db, es):
    additional_fields = {
        "texkeys": ["a123bx"],
        "titles": [{"title": "Jessica Jones"}],
        "authors": [
            {"full_name": "Castle, Frank"},
            {"full_name": "Smith, John"},
            {"full_name": "Black, Joe Jr."},
            {"full_name": "Jimmy"},
        ],
        "collaborations": [{"value": "LHCb"}],
        "dois": [{"value": "10.1088/1361-6633/aa5514"}],
        "arxiv_eprints": [{"value": "1607.06746", "categories": ["hep-th"]}],
        "publication_info": [
            {
                "journal_title": "Phys.Rev.A",
                "journal_volume": "58",
                "page_start": "500",
                "page_end": "593",
                "artid": "17920",
                "year": 2014,
            }
        ],
        "report_numbers": [{"value": "DESY-17-036"}],
    }
    data = faker.record("lit", data=additional_fields)
    record = LiteratureRecord.create(data)
    dump = record.serialize_for_es()
    expected_latex_eu_display = "%\\cite{a123bx}\n\\bibitem{a123bx}\nF.~Castle \\textit{et al.} [LHCb],\n%``Jessica Jones,''\nPhys.\\ Rev.\\ A \\textbf{58} (2014), 500-593\ndoi:10.1088/1361-6633/aa5514\n[arXiv:1607.06746 [hep-th]].\n%0 citations counted in INSPIRE as of 19 Dec 1994"
    expected_latex_us_display = "%\\cite{a123bx}\n\\bibitem{a123bx}\nF.~Castle \\textit{et al.} [LHCb],\n%``Jessica Jones,''\nPhys.\\ Rev.\\ A \\textbf{58}, 500-593 (2014)\ndoi:10.1088/1361-6633/aa5514\n[arXiv:1607.06746 [hep-th]].\n%0 citations counted in INSPIRE as of 19 Dec 1994"
    expected_bibtex_display = '@article{a123bx,\n    author = "Castle, Frank and Smith, John and Black, Joe Jr. and Jimmy",\n    archivePrefix = "arXiv",\n    collaboration = "LHCb",\n    doi = "10.1088/1361-6633/aa5514",\n    eprint = "1607.06746",\n    journal = "Phys.\\ Rev.\\ A",\n    pages = "17920",\n    primaryClass = "hep-th",\n    reportNumber = "DESY-17-036",\n    title = "{Jessica Jones}",\n    volume = "58",\n    year = "2014"\n}\n'
    assert expected_latex_eu_display == dump["_latex_eu_display"]
    assert expected_latex_us_display == dump["_latex_us_display"]
    assert expected_bibtex_display == dump["_bibtex_display"]


@mock.patch(
    "inspirehep.records.serializers.bibtex.literature_bibtex.create_bibliography"
)
def test_dump_for_es_catches_bibtex_exception(mock_bibtex, base_app, db, es):
    mock_bibtex.side_effect = Exception
    data = faker.record("lit")
    record = LiteratureRecord.create(data)
    expected_result = (
        f"% Bibtex generation failed for record {record.get('control_number')}"
    )
    dump = record.serialize_for_es()
    assert expected_result == dump["_bibtex_display"]


def test_create_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("lit")
    record = InspireRecord.create(data)
    assert type(record) == LiteratureRecord
    assert record.pid_type == "lit"

    record = LiteratureRecord.create(data)
    assert type(record) == LiteratureRecord
    assert record.pid_type == "lit"


def test_create_or_update_record_from_db_depending_on_its_pid_type(base_app, db, es):
    data = faker.record("lit")
    record = InspireRecord.create_or_update(data)
    assert type(record) == LiteratureRecord
    assert record.pid_type == "lit"

    data_update = {"titles": [{"title": "UPDATED"}]}
    data.update(data_update)
    record = InspireRecord.create_or_update(data)
    assert type(record) == LiteratureRecord
    assert record.pid_type == "lit"


def test_import_article_bad_arxiv_id(base_app, db, es):
    with pytest.raises(UnknownImportIdentifierError):
        import_article("bad_arXiv:1207.7214")


def test_import_article_bad_doi(base_app, db, es):
    with pytest.raises(UnknownImportIdentifierError):
        import_article("doi:Th1s1s/n0taD01")


def test_import_article_arxiv_id_already_in_inspire(base_app, db, es):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    LiteratureRecord.create(data)

    with pytest.raises(ExistingArticleError):
        import_article(f"arXiv:{arxiv_value}")


def test_import_article_doi_already_in_inspire(base_app, db, es):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    LiteratureRecord.create(data)

    with pytest.raises(ExistingArticleError):
        import_article(doi_value)


def test_create_record_update_citation_table(base_app, db, es):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    data2 = faker.record("lit", literature_citations=[record["control_number"]])
    record2 = LiteratureRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1


def test_update_record_update_citation_table(base_app, db, es):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    data2 = faker.record("lit")
    record2 = LiteratureRecord.create(data2)

    # Cannot use model.citations and model.references
    # when updating record which is not commited,
    # as they will return data from before the update
    assert len(RecordCitations.query.all()) == 0

    data = faker.record(
        "lit", data=record, literature_citations=[record2["control_number"]]
    )
    record.update(data)

    assert len(RecordCitations.query.all()) == 1


def test_complex_records_interactions_in_citation_table(base_app, db, es):
    records_list = []
    for i in range(6):
        data = faker.record(
            "lit", literature_citations=[r["control_number"] for r in records_list]
        )
        record = LiteratureRecord.create(data)
        records_list.append(record)

    assert len(records_list[0].model.citations) == 5
    assert len(records_list[0].model.references) == 0

    assert len(records_list[1].model.citations) == 4
    assert len(records_list[1].model.references) == 1

    assert len(records_list[2].model.citations) == 3
    assert len(records_list[2].model.references) == 2

    assert len(records_list[3].model.citations) == 2
    assert len(records_list[3].model.references) == 3

    assert len(records_list[4].model.citations) == 1
    assert len(records_list[4].model.references) == 4

    assert len(records_list[5].model.citations) == 0
    assert len(records_list[5].model.references) == 5


def test_literature_can_cite_data_record(base_app, db, es):
    data = faker.record("dat")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", data_citations=[record["control_number"]])
    record2 = LiteratureRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1


def test_literature_cannot_cite_other_than_data_and_literature_record(base_app, db, es):
    author = InspireRecord.create(faker.record("aut"))
    conference = InspireRecord.create(faker.record("con"))
    experiment = InspireRecord.create(faker.record("exp"))
    institution = InspireRecord.create(faker.record("ins"))
    job = InspireRecord.create(faker.record("job"))
    journal = InspireRecord.create(faker.record("jou"))

    data2 = faker.record(
        "lit",
        literature_citations=[
            author["control_number"],
            conference["control_number"],
            experiment["control_number"],
            institution["control_number"],
            job["control_number"],
            journal["control_number"],
        ],
    )
    record2 = LiteratureRecord.create(data2)

    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 0
    assert len(RecordCitations.query.all()) == 0


def test_literature_can_cite_only_existing_records(base_app, db, es):
    data = faker.record("dat")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", data_citations=[record["control_number"], 9999, 9998])
    record2 = LiteratureRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1


def test_literature_is_not_cited_by_deleted_records(base_app, db, es_clear):
    data = faker.record("lit")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", literature_citations=[record["control_number"]])
    record2 = LiteratureRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1

    record2.delete()
    db.session.refresh(record.model)

    assert len(record.model.citations) == 0
    assert len(record.model.references) == 0
    assert len(RecordCitations.query.all()) == 0


def test_literature_citation_count_property(base_app, db, es):
    data = faker.record("lit")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", literature_citations=[record["control_number"]])
    record2 = LiteratureRecord.create(data2)

    assert record.citation_count == 1
    assert record2.citation_count == 0


def test_literature_without_literature_collection_cannot_cite_record_which_can_be_cited(
    base_app, db, es
):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1)

    data2 = faker.record(
        "lit",
        data={"_collections": ["Fermilab"]},
        literature_citations=[record1["control_number"]],
    )
    record2 = InspireRecord.create(data2)

    data3 = faker.record("lit", literature_citations=[record1["control_number"]])
    record3 = InspireRecord.create(data3)

    assert len(record1.model.citations) == 1
    assert len(record1.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 0
    assert len(record3.model.citations) == 0
    assert len(record3.model.references) == 1


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_create_not_run_orcid_when_passed_parameter_to_disable_orcid(
    orcid_mock, base_app, db
):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1, disable_orcid_push=True)
    assert orcid_mock.call_count == 0


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_create_not_skips_orcid_on_default(orcid_mock, base_app, db, es):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1)
    assert orcid_mock.call_count == 1


@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord.update_refs_in_citation_table"
)
def test_record_create_skips_citation_recalculate_when_passed_parameter_to_skip(
    citation_recalculate_mock, base_app, db, es
):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1, disable_relations_update=True)
    assert citation_recalculate_mock.call_count == 0


@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord.update_refs_in_citation_table"
)
def test_record_create_runs_citation_recalculate_on_default(
    citation_recalculate_mock, base_app, db, es
):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1)
    assert citation_recalculate_mock.call_count == 1


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_update_not_run_orcid_when_passed_parameter_to_disable_orcid(
    orcid_mock, base_app, db, es
):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1, disable_orcid_push=True)
    data2["control_number"] = record1["control_number"]
    record1.update(data2, disable_orcid_push=True)
    assert orcid_mock.call_count == 0


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_update_not_skips_orcid_on_default(orcid_mock, base_app, db, es):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1)
    data2["control_number"] = record1["control_number"]
    record1.update(data2)
    assert orcid_mock.call_count == 2


@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord.update_refs_in_citation_table"
)
def test_record_update_skips_citation_recalculate_when_passed_parameter_to_skip(
    citation_recalculate_mock, base_app, db
):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1, disable_relations_update=True)
    data2["control_number"] = record1["control_number"]
    record1.update(data2, disable_relations_update=True)
    assert citation_recalculate_mock.call_count == 0


@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord.update_refs_in_citation_table"
)
def test_record_update_runs_citation_recalculate_on_default(
    citation_recalculate_mock, base_app, db, es
):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1)
    data2["control_number"] = record1["control_number"]
    record1.update(data2)
    assert citation_recalculate_mock.call_count == 2


def test_get_modified_references(base_app, db, es_clear):
    cited_data = faker.record("lit")
    cited_record_1 = InspireRecord.create(cited_data)

    citing_data = faker.record(
        "lit", literature_citations=[cited_record_1["control_number"]]
    )
    citing_record = LiteratureRecord.create(citing_data)

    assert citing_record.get_modified_references() == [cited_record_1.id]

    cited_data_2 = faker.record("lit")
    cited_record_2 = InspireRecord.create(cited_data_2)

    citing_data["references"] = [
        {
            "record": {
                "$ref": f"http://localhost:5000/api/literature/{cited_record_2['control_number']}"
            }
        }
    ]
    citing_data["control_number"] = citing_record["control_number"]
    citing_record.update(citing_data)

    assert citing_record.get_modified_references() == [cited_record_2.id]

    citing_record.delete()

    assert citing_record.get_modified_references() == [cited_record_2.id]


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_update_authors_signature_blocks_handles_ascii_names(
    mock_uuid4, base_app, db, es_clear, redis
):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    author_data = {"authors": [{"full_name": "Ellis, John Richard"}]}
    data = faker.record("lit", data=author_data)
    record = LiteratureRecord.create(data)

    expected_result = [
        {
            "full_name": "Ellis, John Richard",
            "signature_block": "ELj",
            "uuid": "727238f3-8ed6-40b6-97d2-dc3cd1429131",
        }
    ]

    assert expected_result == record["authors"]


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_update_authors_signature_blocks_handles_unicode_names(
    mock_uuid4, base_app, db, es_clear, redis
):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    author_data = {"authors": [{"full_name": "Páramos, Jorge"}]}
    data = faker.record("lit", data=author_data)
    record = LiteratureRecord.create(data)

    expected_result = [
        {
            "full_name": "Páramos, Jorge",
            "signature_block": "PARANj",
            "uuid": "727238f3-8ed6-40b6-97d2-dc3cd1429131",
        }
    ]

    assert expected_result == record["authors"]


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_update_authors_signature_blocks_handles_jimmy(
    mock_uuid4, base_app, db, es_clear, redis
):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    author_data = {"authors": [{"full_name": "Jimmy"}]}
    data = faker.record("lit", data=author_data)
    record = LiteratureRecord.create(data)

    expected_result = [
        {
            "full_name": "Jimmy",
            "signature_block": "JANY",
            "uuid": "727238f3-8ed6-40b6-97d2-dc3cd1429131",
        }
    ]

    assert expected_result == record["authors"]


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_update_authors_signature_blocks_handles_two_authors_with_the_same_name(
    mock_uuid4, base_app, db, es_clear, redis
):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    author_data = {"authors": [{"full_name": "Jimmy"}]}
    data = faker.record("lit", data=author_data)
    record = LiteratureRecord.create(data)

    expected_result = [
        {
            "full_name": "Jimmy",
            "signature_block": "JANY",
            "uuid": "727238f3-8ed6-40b6-97d2-dc3cd1429131",
        }
    ]

    assert expected_result == record["authors"]


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_update_authors_signature_blocks_discards_empty_signature_blocks(
    mock_uuid4, base_app, db, es_clear, redis
):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    author_data = {"authors": [{"full_name": "ae"}]}
    data = faker.record("lit", data=author_data)
    record = LiteratureRecord.create(data)

    expected_result = [
        {"full_name": "ae", "uuid": "727238f3-8ed6-40b6-97d2-dc3cd1429131"}
    ]

    assert expected_result == record["authors"]


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_update_authors_signature_discards_empty_signature_blocks(
    mock_uuid4, base_app, db, es_clear, redis
):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    author_data = {"authors": [{"full_name": "ae"}]}
    data = faker.record("lit", data=author_data)
    record = LiteratureRecord.create(data)

    expected_result = [
        {"full_name": "ae", "uuid": "727238f3-8ed6-40b6-97d2-dc3cd1429131"}
    ]

    assert expected_result == record["authors"]


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_updating_record_updates_authors_signature_blocks_and_uuids(
    mock_uuid4, base_app, db, es_clear, redis
):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    author_data = {"authors": [{"full_name": "Ellis, John Richard"}]}
    data = faker.record("lit", data=author_data)
    record = LiteratureRecord.create(data)
    expected_result_create = [
        {
            "full_name": "Ellis, John Richard",
            "signature_block": "ELj",
            "uuid": "727238f3-8ed6-40b6-97d2-dc3cd1429131",
        }
    ]

    assert expected_result_create == record["authors"]

    mock_uuid4.return_value = UUID("e14955b0-7e57-41a0-90a8-f4c64eb8f4e9")
    data.update({"authors": [{"full_name": "Jimmy"}]})
    data["control_number"] = record["control_number"]
    record.update(data)
    expected_result_update = [
        {
            "full_name": "Jimmy",
            "signature_block": "JANY",
            "uuid": "e14955b0-7e57-41a0-90a8-f4c64eb8f4e9",
        }
    ]

    assert expected_result_update == record["authors"]


@mock.patch("inspirehep.records.api.literature.uuid.uuid4")
def test_update_authors_uuids_does_not_update_existing_uuids(
    mock_uuid4, base_app, db, es_clear, redis
):
    mock_uuid4.return_value = UUID("727238f3-8ed6-40b6-97d2-dc3cd1429131")
    author_data = {
        "authors": [
            {
                "full_name": "Ellis, John Richard",
                "uuid": "e14955b0-7e57-41a0-90a8-f4c64eb8f4e9",
            }
        ]
    }
    data = faker.record("lit", data=author_data)
    record = LiteratureRecord.create(data)

    expected_result_create = [
        {
            "full_name": "Ellis, John Richard",
            "signature_block": "ELj",
            "uuid": "e14955b0-7e57-41a0-90a8-f4c64eb8f4e9",
        }
    ]

    assert expected_result_create == record["authors"]


def test_create_record_sends_phonetic_blocks_to_redis(base_app, db, es, redis):
    author_data = {"authors": [{"full_name": "Ellis, John Richard"}]}
    data = faker.record("lit", data=author_data)
    LiteratureRecord.create(data)
    assert "ELj" == redis.zpopmin("author_phonetic_blocks")[0][0]


def test_update_record_sends_phonetic_blocks_to_redis(base_app, db, es, redis):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)
    author_data_updated = {"authors": [{"full_name": "Ellis, John Richard"}]}
    data.update(author_data_updated)
    data["control_number"] = record["control_number"]
    record.update(data)
    assert "ELj" == redis.zpopmin("author_phonetic_blocks")[0][0]


def test_phonetic_blocks_keep_order_in_redis_based_on_timestamp(
    base_app, db, es, redis
):
    with freeze_time(datetime.datetime(2015, 8, 18, 8, 51, 50)):
        author_data = {"authors": [{"full_name": "Ellis, John Richard"}]}
        data = faker.record("lit", data=author_data)
        InspireRecord.create(data)

    with freeze_time(datetime.datetime(2015, 8, 18, 9, 51, 50)):
        author_data2 = {"authors": [{"full_name": "Jimmy"}]}
        data2 = faker.record("lit", data=author_data2)
        LiteratureRecord.create(data2)

    assert "ELj" == redis.zpopmin("author_phonetic_blocks")[0][0]
    assert "JANY" == redis.zpopmin("author_phonetic_blocks")[0][0]


def test_phonetic_blocks_not_updated_when_record_does_not_have_lit_collection(
    base_app, db, es, redis
):
    data = {
        "_collections": ["CDS Hidden"],
        "authors": [{"full_name": "Ellis, John Richard"}],
    }
    data = faker.record("lit", data=data)
    record = LiteratureRecord.create(data)
    expected_result_authors = [{"full_name": "Ellis, John Richard"}]
    assert expected_result_authors == record["authors"]
    assert [] == redis.zpopmin("author_phonetic_blocks")


def test_record_cannot_cite_itself(base_app, db, create_record):
    record_control_number = 12345
    record_cited = create_record(
        "lit",
        data={"control_number": record_control_number},
        literature_citations=[record_control_number],
    )
    assert record_cited.citation_count == 0


@pytest.mark.vcr()
def test_add_record_with_documents_and_figures(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_figure_key = "a29b7e90ba08cd1565146fe81ebbecd5"
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_figure_key)
    create_s3_bucket(expected_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "original_url": "http://original-url.com/2",
                "filename": "fermilab.pdf",
            }
        ],
        "figures": [
            {
                "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                "key": "key",
                "original_url": "http://original-url.com/3",
                "filename": "channel.png",
            }
        ],
    }
    record = create_record("lit", data=data)
    expected_documents = [
        {
            "source": "arxiv",
            "key": expected_document_key,
            "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_document_key)}/{expected_document_key}",
            "original_url": "http://original-url.com/2",
            "filename": "fermilab.pdf",
        }
    ]
    expected_figures = [
        {
            "key": expected_figure_key,
            "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_figure_key)}/{expected_figure_key}",
            "filename": "channel.png",
            "original_url": "http://original-url.com/3",
        }
    ]
    assert record["figures"] == expected_figures
    assert record["documents"] == expected_documents
    assert s3.file_exists(expected_figure_key) is True
    assert s3.file_exists(expected_document_key) is True
    metadata_document = s3.get_file_metadata(expected_document_key)
    assert (
        metadata_document["ContentDisposition"]
        == f'attachment; filename="fermilab.pdf"'
    )
    assert metadata_document["ContentType"] == "application/pdf"
    metadata_figure = s3.get_file_metadata(expected_figure_key)
    assert (
        metadata_figure["ContentDisposition"] == f'attachment; filename="channel.png"'
    )
    assert metadata_figure["ContentType"] == "image/png"


@pytest.mark.vcr()
def test_adding_record_with_documents_skips_hidden(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    expected_hidden_document_key = "b88e6b880b32d8ed06b9b740cfb6eb2a"
    create_s3_bucket(expected_document_key)
    create_s3_bucket(expected_hidden_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://inspirehep.net/record/212819/files/slac-pub-3557.pdf?version=1",
                "original_url": "http://original-url.com/2",
                "filename": "myhiddenfile.pdf",
                "hidden": True,
            },
            {
                "source": "arxiv",
                "key": "key",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "original_url": "http://original-url.com/2",
                "filename": "fermilab.pdf",
            },
        ]
    }
    record = create_record("lit", data=data)
    expected_hidden_document = {
        "source": "arxiv",
        "key": "arXiv:nucl-th_9310031.pdf",
        "url": "http://inspirehep.net/record/212819/files/slac-pub-3557.pdf?version=1",
        "original_url": "http://original-url.com/2",
        "filename": "myhiddenfile.pdf",
        "hidden": True,
    }
    expected_document = {
        "source": "arxiv",
        "key": expected_document_key,
        "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_document_key)}/{expected_document_key}",
        "original_url": "http://original-url.com/2",
        "filename": "fermilab.pdf",
    }
    assert expected_document in record["documents"]
    assert expected_hidden_document in record["documents"]
    assert s3.file_exists(expected_document_key) is True
    assert s3.file_exists(expected_hidden_document_key) is False


@pytest.mark.vcr()
def test_adding_record_with_duplicated_documents_and_figures(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_figure_key = "a29b7e90ba08cd1565146fe81ebbecd5"
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_figure_key)
    create_s3_bucket(expected_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "original_url": "http://original-url.com/2",
                "filename": "fermilab.pdf",
            },
            {
                "source": "arxiv",
                "key": "key2",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "original_url": "http://original-url.com/1",
                "filename": "fermilab2.pdf",
            },
        ],
        "figures": [
            {
                "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                "key": "key",
                "original_url": "http://original-url.com/3",
                "filename": "channel.jpg",
            },
            {
                "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                "key": "key2",
                "original_url": "http://original-url.com/4",
                "filename": "channel2.jpg",
            },
        ],
    }
    record = create_record("lit", data=data)
    expected_documents = [
        {
            "source": "arxiv",
            "key": expected_document_key,
            "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_document_key)}/{expected_document_key}",
            "original_url": "http://original-url.com/2",
            "filename": "fermilab.pdf",
        }
    ]
    expected_figures = [
        {
            "key": expected_figure_key,
            "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_figure_key)}/{expected_figure_key}",
            "filename": "channel.jpg",
            "original_url": "http://original-url.com/3",
        }
    ]
    assert record["figures"] == expected_figures
    assert record["documents"] == expected_documents
    assert s3.file_exists(expected_figure_key) is True
    assert s3.file_exists(expected_document_key) is True


@pytest.mark.vcr()
def test_adding_record_with_document_without_filename(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "key",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "original_url": "http://original-url.com/2",
            }
        ]
    }
    record = create_record("lit", data=data)
    expected_documents = [
        {
            "source": "arxiv",
            "key": expected_document_key,
            "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_document_key)}/{expected_document_key}",
            "original_url": "http://original-url.com/2",
            "filename": "key",
        }
    ]
    assert expected_documents == record["documents"]
    assert s3.file_exists(expected_document_key) is True
    metadata_document = s3.get_file_metadata(expected_document_key)
    assert metadata_document["ContentDisposition"] == f'attachment; filename="key"'


@pytest.mark.vcr()
def test_adding_record_with_documents_with_existing_file_updates_metadata(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "key",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "original_url": "http://original-url.com/2",
                "filename": "file1.pdf",
            }
        ]
    }
    create_record("lit", data=data)
    assert s3.file_exists(expected_document_key) is True
    metadata_document = s3.get_file_metadata(expected_document_key)
    assert (
        metadata_document["ContentDisposition"] == f'attachment; filename="file1.pdf"'
    )
    data["documents"][0]["filename"] = "file2.pdf"
    create_record("lit", data=data)
    assert s3.file_exists(expected_document_key) is True
    metadata_document = s3.get_file_metadata(expected_document_key)
    assert (
        metadata_document["ContentDisposition"] == f'attachment; filename="file2.pdf"'
    )


@pytest.mark.vcr()
def test_adding_record_with_documents_with_full_url_without_original_url(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "key",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "filename": "file1.pdf",
            }
        ]
    }
    record = create_record("lit", data=data)
    expected_documents = [
        {
            "source": "arxiv",
            "key": expected_document_key,
            "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_document_key)}/{expected_document_key}",
            "original_url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
            "filename": "file1.pdf",
        }
    ]
    assert s3.file_exists(expected_document_key) is True
    assert expected_documents == record["documents"]


def test_adding_record_with_documents_with_relative_url_without_original_url(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    with requests_mock.Mocker() as mocker:
        mocker.get(
            "http://localhost:5000/api/files/file1.pdf",
            status_code=200,
            content=b"This is a file",
        )

        expected_document_key = "5276effc61dd44a9fe1d5354bf2ad9c4"
        create_s3_bucket(expected_document_key)
        data = {
            "documents": [
                {
                    "source": "arxiv",
                    "key": "key",
                    "url": "/api/files/file1.pdf",
                    "filename": "file1.pdf",
                }
            ]
        }
        record = create_record("lit", data=data)
        expected_documents = [
            {
                "source": "arxiv",
                "key": expected_document_key,
                "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_document_key)}/{expected_document_key}",
                "filename": "file1.pdf",
            }
        ]
        assert s3.file_exists(expected_document_key) is True
        assert expected_documents == record["documents"]


@pytest.mark.vcr()
def test_adding_deleted_record_with_documents_does_not_add_files(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_document_key)
    data = {
        "deleted": True,
        "documents": [
            {
                "source": "arxiv",
                "key": "key",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "filename": "file1.pdf",
            }
        ],
    }
    create_record("lit", data=data)
    assert s3.file_exists(expected_document_key) is False


@pytest.mark.vcr()
def test_update_record_with_documents_and_figures(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_figure_key = "a29b7e90ba08cd1565146fe81ebbecd5"
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_figure_key)
    create_s3_bucket(expected_document_key)
    record = create_record("lit")
    data = dict(record)
    data.update(
        {
            "documents": [
                {
                    "source": "arxiv",
                    "key": "arXiv:nucl-th_9310031.pdf",
                    "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                    "original_url": "http://original-url.com/2",
                    "filename": "fermilab.pdf",
                }
            ],
            "figures": [
                {
                    "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                    "key": "key",
                    "original_url": "http://original-url.com/3",
                    "filename": "channel.png",
                }
            ],
        }
    )
    record.update(data)
    expected_documents = [
        {
            "source": "arxiv",
            "key": expected_document_key,
            "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_document_key)}/{expected_document_key}",
            "original_url": "http://original-url.com/2",
            "filename": "fermilab.pdf",
        }
    ]
    expected_figures = [
        {
            "key": expected_figure_key,
            "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_figure_key)}/{expected_figure_key}",
            "filename": "channel.png",
            "original_url": "http://original-url.com/3",
        }
    ]
    assert record["figures"] == expected_figures
    assert record["documents"] == expected_documents
    assert s3.file_exists(expected_figure_key) is True
    assert s3.file_exists(expected_document_key) is True
    metadata_document = s3.get_file_metadata(expected_document_key)
    assert (
        metadata_document["ContentDisposition"]
        == f'attachment; filename="fermilab.pdf"'
    )
    assert metadata_document["ContentType"] == "application/pdf"
    metadata_figure = s3.get_file_metadata(expected_figure_key)
    assert (
        metadata_figure["ContentDisposition"] == f'attachment; filename="channel.png"'
    )
    assert metadata_figure["ContentType"] == "image/png"


@pytest.mark.vcr()
def test_update_record_remove_documents_and_figures(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_figure_key = "a29b7e90ba08cd1565146fe81ebbecd5"
    expected_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_figure_key)
    create_s3_bucket(expected_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "original_url": "http://original-url.com/2",
                "filename": "fermilab.pdf",
            }
        ],
        "figures": [
            {
                "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                "key": "key",
                "original_url": "http://original-url.com/3",
                "filename": "channel.png",
            }
        ],
    }
    record = create_record("lit", data)
    data = dict(record)
    del data["documents"]
    del data["figures"]
    record.update(data)

    assert "figures" not in record
    assert "documents" not in record


@pytest.mark.vcr()
def test_update_record_add_more_documents(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_document_key = "b88e6b880b32d8ed06b9b740cfb6eb2a"
    expected_updated_document_key = "f276b50c9e6401b5e212785a496efa4e"
    create_s3_bucket(expected_document_key)
    create_s3_bucket(expected_updated_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://inspirehep.net/record/212819/files/slac-pub-3557.pdf?version=1",
                "original_url": "http://original-url.com/2",
                "filename": "myfile.pdf",
            }
        ]
    }
    record = create_record("lit", data)
    data = dict(record)
    data_with_added_document = {
        "documents": [
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://inspirehep.net/record/212819/files/slac-pub-3557.pdf?version=1",
                "original_url": "http://original-url.com/2",
                "filename": "myfile.pdf",
            },
            {
                "source": "arxiv",
                "key": "key",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                "original_url": "http://original-url.com/2",
                "filename": "fermilab.pdf",
            },
        ]
    }
    data.update(data_with_added_document)
    record.update(data)
    expected_document_old = {
        "source": "arxiv",
        "key": expected_document_key,
        "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_document_key)}/{expected_document_key}",
        "original_url": "http://original-url.com/2",
        "filename": "myfile.pdf",
    }
    expected_document_new = {
        "source": "arxiv",
        "key": expected_updated_document_key,
        "url": f"{base_app.config.get('S3_HOSTNAME')}/{current_s3_instance.get_bucket_for_file_key(expected_updated_document_key)}/{expected_updated_document_key}",
        "original_url": "http://original-url.com/2",
        "filename": "fermilab.pdf",
    }
    assert expected_document_old in record["documents"]
    assert expected_document_new in record["documents"]
    assert s3.file_exists(expected_updated_document_key) is True
    assert s3.file_exists(expected_document_key) is True
    metadata_document = s3.get_file_metadata(expected_updated_document_key)
    assert (
        metadata_document["ContentDisposition"]
        == f'attachment; filename="fermilab.pdf"'
    )
    assert metadata_document["ContentType"] == "application/pdf"


def test_literature_updates_refs_to_known_conferences(base_app, db, create_record):
    con1 = create_record("con", {"opening_date": "2013-01-01"})
    con2 = create_record("con", {"opening_date": "2020-12-12"})

    lit_data = {"publication_info": [{"cnum": con1["cnum"]}, {"cnum": con2["cnum"]}]}

    expected_publication_info = [
        {
            "cnum": con1["cnum"],
            "conference_record": {
                "$ref": f"http://localhost:5000/api/conferences/{con1['control_number']}"
            },
        },
        {
            "cnum": con2["cnum"],
            "conference_record": {
                "$ref": f"http://localhost:5000/api/conferences/{con2['control_number']}"
            },
        },
    ]
    lit = create_record("lit", data=lit_data)

    assert expected_publication_info == lit["publication_info"]


def test_literature_updates_refs_to_known_and_unknown_conference(
    base_app, db, create_record
):
    con = create_record("con", {"opening_date": "2013-01-01"})

    lit_data = {"publication_info": [{"cnum": con["cnum"]}, {"cnum": "C99-11-11.111"}]}

    expected_publication_info = [
        {
            "cnum": con["cnum"],
            "conference_record": {
                "$ref": f"http://localhost:5000/api/conferences/{con['control_number']}"
            },
        },
        {"cnum": "C99-11-11.111"},
    ]
    lit = create_record("lit", data=lit_data)

    assert expected_publication_info == lit["publication_info"]


def test_literature_updates_refs_to_known_and_unknown_conference_when_ref_already_exists(
    base_app, db, create_record
):
    con = create_record("con", {"opening_date": "2013-01-01"})

    lit_data = {
        "publication_info": [
            {
                "cnum": con["cnum"],
                "conference_record": {
                    "$ref": f"http://localhost:5000/api/conferences/123"
                },
            },
            {
                "cnum": "C99-11-11.111",
                "conference_record": {
                    "$ref": f"http://localhost:5000/api/conferences/123"
                },
            },
        ]
    }

    expected_publication_info = [
        {
            "cnum": con["cnum"],
            "conference_record": {
                "$ref": f"http://localhost:5000/api/conferences/{con['control_number']}"
            },
        },
        {
            "cnum": "C99-11-11.111",
            "conference_record": {"$ref": "http://localhost:5000/api/conferences/123"},
        },
    ]
    lit = create_record("lit", data=lit_data)

    assert expected_publication_info == lit["publication_info"]


def test_do_not_add_files_which_are_already_on_s3(
    base_app, db, es, create_record, enable_files, s3
):
    data = {
        "documents": [
            {
                "filename": "1905.03764.pdf",
                "key": "some_document_key_on_s3",
                "original_url": "http://inspire-afs-web.cern.ch/var/data/files/g188/3771224/content.pdf%3B2",
                "source": "arxiv",
                "url": "https://s3.cern.ch/inspire-qa-files-s/some_document_key_on_s3",
            }
        ],
        "figures": [
            {
                "caption": "some caption",
                "filename": "Global_noH3_EW_couplings_flat.png",
                "key": "some_figure_key_on_s3",
                "original_url": "http://inspire-afs-web.cern.ch/var/data/files/g188/3771220/content.png%3B2",
                "source": "arxiv",
                "url": "https://s3.cern.ch/inspire-qa-files-s/some_figure_key_on_s3",
            }
        ],
    }
    with mock.patch.object(s3, "replace_file_metadata") as mocked_s3_replace_metadata:
        record = create_record("lit", data=data)
        mocked_s3_replace_metadata.assert_not_called()
    expected_documents = [
        {
            "filename": "1905.03764.pdf",
            "key": "some_document_key_on_s3",
            "original_url": "http://inspire-afs-web.cern.ch/var/data/files/g188/3771224/content.pdf%3B2",
            "source": "arxiv",
            "url": "https://s3.cern.ch/inspire-qa-files-s/some_document_key_on_s3",
        }
    ]
    expected_figures = [
        {
            "caption": "some caption",
            "filename": "Global_noH3_EW_couplings_flat.png",
            "key": "some_figure_key_on_s3",
            "original_url": "http://inspire-afs-web.cern.ch/var/data/files/g188/3771220/content.png%3B2",
            "source": "arxiv",
            "url": "https://s3.cern.ch/inspire-qa-files-s/some_figure_key_on_s3",
        }
    ]
    assert record["figures"] == expected_figures
    assert record["documents"] == expected_documents


def test_files_metadata_is_replaced_when_replacing_metadata_is_enabled(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_figure_key = "cb071d80d1a54f21c8867a038f6a6c66"
    expected_document_key = "fdc3bdefb79cec8eb8211d2499e04704"
    create_s3_bucket(expected_figure_key)
    create_s3_bucket(expected_document_key)
    data = {
        "documents": [
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://original-url.com/2",
                "filename": "fermilab.pdf",
            }
        ],
        "figures": [{"url": "http://original-url.com/3", "key": "channel.png"}],
    }

    figure_content = b"figure"
    document_content = b"document"
    with requests_mock.Mocker() as mocker:
        mocker.get(
            "http://original-url.com/2", status_code=200, content=document_content
        )
        mocker.get("http://original-url.com/3", status_code=200, content=figure_content)
        mocker.get(
            s3.get_file_url(expected_document_key),
            status_code=200,
            content=document_content,
        )
        mocker.get(
            s3.get_file_url(expected_figure_key),
            status_code=200,
            content=figure_content,
        )

        record = create_record("lit", data=data)

        record_data = dict(record)
        files_count = 2
        with mock.patch.dict(base_app.config, {"UPDATE_S3_FILES_METADATA": True}):
            with mock.patch.object(
                s3, "replace_file_metadata"
            ) as mocked_s3_replace_metadata:
                record.update(record_data)
                assert mocked_s3_replace_metadata.call_count == files_count


def test_adding_files_with_s3_url_but_wrong_key(
    base_app, db, es, create_record, enable_files, s3, create_s3_bucket
):
    expected_figure_key = "cb071d80d1a54f21c8867a038f6a6c66"
    expected_document_key = "fdc3bdefb79cec8eb8211d2499e04704"
    create_s3_bucket(expected_figure_key)
    create_s3_bucket(expected_document_key)
    data = {
        "documents": [
            {
                "url": s3.get_file_url(expected_document_key),
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "original_url": "http://original-url.com/2",
            }
        ],
        "figures": [
            {
                "url": s3.get_file_url(expected_figure_key),
                "original_url": "http://original-url.com/3",
                "key": "channel.png",
            }
        ],
    }

    expected_documents = [
        {
            "url": s3.get_file_url(expected_document_key),
            "source": "arxiv",
            "filename": "arXiv:nucl-th_9310031.pdf",
            "original_url": "http://original-url.com/2",
            "key": expected_document_key,
        }
    ]

    expected_figures = [
        {
            "url": s3.get_file_url(expected_figure_key),
            "original_url": "http://original-url.com/3",
            "filename": "channel.png",
            "key": expected_figure_key,
        }
    ]

    figure_content = b"figure"
    document_content = b"document"
    with requests_mock.Mocker() as mocker:
        mocker.get(
            s3.get_file_url(expected_document_key),
            status_code=200,
            content=document_content,
        )
        mocker.get(
            s3.get_file_url(expected_figure_key),
            status_code=200,
            content=figure_content,
        )

        record = create_record("lit", data=data)

        assert record["figures"] == expected_figures
        assert record["documents"] == expected_documents
