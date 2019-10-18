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
from freezegun import freeze_time
from helpers.providers.faker import faker
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError

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
            "arxiv_eprints": [{"value": arxiv_value_new}],
            "dois": [{"value": doi_value_new}],
        }
    )
    record.clear()
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
    expected_bibtex_display = '@article{a123bx,\n    author = "Castle, Frank and Smith, John and Black, Joe Jr. and Jimmy",\n    archivePrefix = "arXiv",\n    collaboration = "LHCb",\n    doi = "10.1088/1361-6633/aa5514",\n    eprint = "1607.06746",\n    journal = "Phys.Rev.A",\n    pages = "17920",\n    primaryClass = "hep-th",\n    reportNumber = "DESY-17-036",\n    title = "Jessica Jones",\n    volume = "58",\n    year = "2014"\n}\n'
    assert expected_latex_eu_display == dump["_latex_eu_display"]
    assert expected_latex_us_display == dump["_latex_us_display"]
    assert expected_bibtex_display == dump["_bibtex_display"]


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
    record1 = InspireRecord.create(data1, disable_citation_update=True)
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
    record1.update(data2, disable_orcid_push=True)
    assert orcid_mock.call_count == 0


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_update_not_skips_orcid_on_default(orcid_mock, base_app, db, es):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1)
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
    record1 = InspireRecord.create(data1, disable_citation_update=True)
    record1.update(data2, disable_citation_update=True)
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


def test_literature_create_with_documents_and_figures(
    fsopen_mock, base_app, db, es, enable_files
):

    data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    assert len(record.files.keys) == 2

    expected_figure_filename = "file.png"
    expected_document_filename = "file_name.pdf"
    expected_files_len = 2

    files_filenames = [file_["filename"] for file_ in record["_files"]]
    assert expected_document_filename in files_filenames
    assert expected_figure_filename in files_filenames

    assert "documents" in record
    assert "figures" in record

    assert len(record["documents"]) == 1
    assert len(record["figures"]) == 1
    assert expected_files_len == len(record["_files"])


def test_literature_update_documents_and_figures(
    fsopen_mock, base_app, db, es, enable_files
):
    files = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", with_control_number=True, data=files)
    record = LiteratureRecord.create(data)

    updated_files = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/figure2.pdf", "key": "key"}],
    }

    data.update(updated_files)
    record.update(data)

    expected_document_filename = "file_name.pdf"
    expected_figure_filename = "figure2.pdf"
    expected_files_len = 2

    files_filenames = [f["filename"] for f in record["_files"]]
    assert expected_document_filename in files_filenames
    assert expected_figure_filename in files_filenames

    assert len(record["documents"]) == 1
    assert len(record["figures"]) == 1
    assert expected_files_len == len(record["_files"])


def test_literature_update_documents_without_figures(
    fsopen_mock, base_app, db, es, enable_files
):
    files = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", with_control_number=True, data=files)
    record = LiteratureRecord.create(data)

    del record["figures"]
    record.update(dict(record))

    expected_document_filename = "file_name.pdf"
    expected_files_len = 1

    files_filenames = [f["filename"] for f in record["_files"]]

    assert expected_document_filename in files_filenames
    assert len(record["documents"]) == 1
    assert "figures" not in record
    assert expected_files_len == len(record["_files"])


def test_literature_update_documents_without_documents(
    fsopen_mock, base_app, db, es, enable_files
):
    files = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", with_control_number=True, data=files)
    record = LiteratureRecord.create(data)
    del record["documents"]
    record.update(dict(record))

    expected_figure_filename = "file.png"
    expected_files_len = 1

    files_filenames = [f["filename"] for f in record["_files"]]

    assert expected_figure_filename in files_filenames
    assert len(record["figures"]) == 1
    assert "documents" not in record
    assert expected_files_len == len(record["_files"])


def test_literature_update_documents_without_documents_and_figures(
    fsopen_mock, base_app, db, es, enable_files
):
    files = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", with_control_number=True, data=files)
    record = LiteratureRecord.create(data)
    del record["documents"]
    del record["figures"]

    record.update(dict(record))

    expected_figure_filename = "file.png"
    expected_files_len = 0

    assert "figures" not in record
    assert "documents" not in record
    assert expected_files_len == len(record["_files"])


def test_literature_documents_and_figures_are_accessible_from_any_user(
    fsopen_mock, api_client, db, es, enable_files
):

    data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    document_file_key = record["documents"][0]["key"]
    figures_file_key = record["figures"][0]["key"]

    response_document = api_client.get(
        f"/api/files/{record._bucket}/{document_file_key}"
    )
    expected_document_status_code = 200
    assert expected_document_status_code == response_document.status_code

    response_figure = api_client.get(f"/api/files/{record._bucket}/{figures_file_key}")
    expected_figure_status = 200
    assert expected_figure_status == response_figure.status_code


def test_add_document_and_figures_default_parameters(
    fsopen_mock, base_app, db, enable_files
):
    data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    data_document = record["documents"][0]
    data_document_key = data_document["key"]
    data_figure = record["figures"][0]
    data_figure_key = data_figure["key"]

    expected_document_filename = "file_name.pdf"
    expected_document_original_url = "http://document_url.cern.ch/file.pdf"
    expected_document_url = (
        f"/api/files/{record.files[data_document_key].bucket_id}/{data_document_key}"
    )

    expected_figure_filename = "file.png"
    expected_figure_original_url = "http://figure_url.cern.ch/file.png"
    expected_figure_url = (
        f"/api/files/{record.files[data_figure_key].bucket_id}/{data_figure_key}"
    )

    assert data_document["filename"] == expected_document_filename
    assert data_document["key"] in record.files.keys
    assert "hidden" not in data_document
    assert data_document["fulltext"] is True
    assert data_document["original_url"] == expected_document_original_url
    assert data_document["url"] == expected_document_url

    assert data_figure["filename"] == expected_figure_filename
    assert data_figure["key"] in record.files.keys
    assert data_figure["original_url"] == expected_figure_original_url
    assert data_figure["url"] == expected_figure_url


def test_add_documents_changed_parameters(
    fsopen_mock, base_app, db, create_record, enable_files
):
    data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
                "fulltext": False,
                "hidden": True,
            }
        ]
    }

    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)

    data_document = record["documents"][0]
    data_document_key = data_document["key"]
    expected_document_filename = "file_name.pdf"
    expected_document_original_url = "http://document_url.cern.ch/file.pdf"
    expected_document_url = (
        f"/api/files/{record.files[data_document_key].bucket_id}/{data_document_key}"
    )

    assert data_document["filename"] == expected_document_filename
    assert data_document["key"] in record.files.keys
    assert data_document["hidden"] is True
    assert "fulltext" not in data_document
    assert data_document["original_url"] == expected_document_original_url
    assert data_document["url"] == expected_document_url
