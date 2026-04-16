import pytest
from airflow.models import DagBag
from hooks.backoffice.workflow_management_hook import HEP
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_hook import (
    InspireHttpHook,
)
from include.utils import workflows
from include.utils.constants import (
    HEP_CREATE,
    LITERATURE_PID_TYPE,
)
from inspire_schemas.api import load_schema, validate

from tests.test_utils import get_inspire_http_record, task_test2

dagbag = DagBag()


@pytest.mark.usefixtures("hep_env")
class TestWorkflowUtils:
    workflow_id = "bf92a2c3-610c-4d9e-bb8f-5a20d519accc"
    dag = dagbag.get_dag("hep_create_dag")

    @pytest.mark.vcr
    def test_read_wf_record_source_not_found(self):
        record = get_inspire_http_record(LITERATURE_PID_TYPE, 44707)
        head_uuid = record["uuid"]

        root = {"version": "original", "acquisition_source": {"source": "arXiv"}}

        workflow_data = {
            "id": self.workflow_id,
            "merge_details": {"head_uuid": head_uuid},
        }
        preserved_root_entry = {
            "id": self.workflow_id,
            "data": root,
        }
        self.s3_store.write_workflow(workflow_data)
        self.s3_store.write_workflow(preserved_root_entry, filename="root.json")

        task_test2(
            self.dag,
            "store_root",
            context_params={"workflow_id": self.workflow_id},
        )

        root_entry = workflows.read_wf_record_source(head_uuid, "publisher")

        assert root_entry == []

    @pytest.mark.parametrize(
        ("source", "expected_source"),
        [
            ("publisher", "publisher"),
            ("desy", "publisher"),
            ("jessica jones", "publisher"),
            ("arxiv", "arxiv"),
            ("submitter", "submitter"),
        ],
    )
    def test_get_source_root(self, source, expected_source):
        result = workflows.get_source_for_root(source)

        assert expected_source == result

    def test_has_same_source(self):
        workflow_1 = {"data": {"acquisition_source": {"source": "Publisher"}}}
        workflow_2 = {"data": {"acquisition_source": {"source": "publisher"}}}
        assert workflows.has_same_source(workflow_1, workflow_2) is True

        workflow_3 = {"data": {"acquisition_source": {"source": "arXiv"}}}
        assert workflows.has_same_source(workflow_1, workflow_3) is False

    @pytest.mark.vcr
    def test_has_previously_rejected_wf_in_backoffice_w_same_source_true(self):
        workflow_data = {
            "id": "some-id",
            "data": {
                "acquisition_source": {"source": "arXiv"},
                "arxiv_eprints": [{"value": "2504.01123"}],
            },
        }

        result = workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
            workflow_data=workflow_data
        )
        assert result is True

    @pytest.mark.vcr
    def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_no_identifier(
        self,
    ):
        workflow_data = {
            "id": "some-id",
            "data": {"acquisition_source": {"source": "arXiv"}},
        }

        result = workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
            workflow_data=workflow_data
        )

        assert result is False

    @pytest.mark.vcr
    def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_no_rejection(
        self,
    ):
        workflow_data = {
            "data": {
                "acquisition_source": {"source": "arXiv"},
                "arxiv_eprints": [{"value": "2507.26819"}],
            }
        }

        result = workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
            workflow_data
        )
        assert result is False

    @pytest.mark.vcr
    def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_diff_source(
        self,
    ):
        workflow_data = {
            "id": "some-id",
            "data": {
                "acquisition_source": {"source": "bad_source"},
                "arxiv_eprints": [{"value": "2504.01123"}],
            },
        }

        result = workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
            workflow_data
        )
        assert result is False

    def test_is_arxiv_paper_returns_false_if_acquision_source_is_not_present(self):
        assert not workflows.is_arxiv_paper({})

    def test_is_arxiv_paper_returns_false_if_method_is_not_hepcrawl_or_arxiv(self):
        schema = load_schema("hep")
        acquisition_source_schema = schema["properties"]["acquisition_source"]
        arxiv_eprints_schema = schema["properties"]["arxiv_eprints"]

        data = {
            "acquisition_source": {
                "method": "batchuploader",
                "source": "arxiv",
            },
            "arxiv_eprints": [
                {
                    "categories": [
                        "hep-th",
                    ],
                    "value": "0801.4782",
                },
            ],
        }
        assert validate(data["acquisition_source"], acquisition_source_schema) is None
        assert validate(data["arxiv_eprints"], arxiv_eprints_schema) is None

        assert not workflows.is_arxiv_paper(data)

    def test_is_arxiv_paper_for_submission(self):
        schema = load_schema("hep")
        acquisition_source_schema = schema["properties"]["acquisition_source"]
        arxiv_eprints_schema = schema["properties"]["arxiv_eprints"]

        data = {
            "acquisition_source": {
                "method": "submitter",
            },
            "arxiv_eprints": [
                {
                    "categories": [
                        "hep-th",
                    ],
                    "value": "0801.4782",
                },
            ],
        }
        assert validate(data["acquisition_source"], acquisition_source_schema) is None
        assert validate(data["arxiv_eprints"], arxiv_eprints_schema) is None

        assert workflows.is_arxiv_paper(data)

    def test_is_arxiv_paper_returns_false_when_no_arxiv_eprints_in_submission(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]

        data = {
            "acquisition_source": {
                "method": "submitter",
            },
        }
        assert validate(data["acquisition_source"], subschema) is None

        assert not workflows.is_arxiv_paper(data)

    def test_is_arxiv_paper_for_hepcrawl(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]

        data = {
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "arxiv",
            },
        }
        assert validate(data["acquisition_source"], subschema) is None

        assert workflows.is_arxiv_paper(data)

    def test_is_arxiv_paper_ignores_case_for_hepcrawl(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]

        data = {
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "arXiv",
            },
        }
        assert validate(data["acquisition_source"], subschema) is None

        assert workflows.is_arxiv_paper(data)

    def test_is_arxiv_paper_returns_false_if_source_is_not_arxiv_for_hepcrawl(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]

        data = {
            "acquisition_source": {
                "method": "hepcrawl",
                "source": "something else",
            },
        }
        assert validate(data["acquisition_source"], subschema) is None

        assert not workflows.is_arxiv_paper(data)

    def test_is_arxiv_paper_returns_false_if_source_is_not_present_for_hepcrawl(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]

        data = {
            "acquisition_source": {
                "method": "hepcrawl",
            },
        }
        assert validate(data["acquisition_source"], subschema) is None

        assert not workflows.is_arxiv_paper(data)

    def test_check_if_france_in_fulltext_when_france_in_header(self, datadir):
        filename = datadir / "grobid_authors_full_response.txt"
        fulltext = filename.read_text()

        france_in_fulltext = workflows.check_if_france_in_fulltext(fulltext)

        assert france_in_fulltext

    def test_check_if_france_in_fulltext_doesnt_include_francesco(self):
        fake_grobid_response = "<author>Francesco, Papa</author>"

        france_in_fulltext = workflows.check_if_france_in_fulltext(fake_grobid_response)

        assert not france_in_fulltext

    def test_check_if_france_in_affiliations(self):
        workflow = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [
                            {
                                "value": "Laboratoire de Physique des 2"
                                " Infinis Irene Joliot-Curie (IJCLab), CNRS, "
                                "Université Paris-Saclay, Orsay, 91405, France"
                            }
                        ],
                    }
                ]
            }
        }

        result = workflows.check_if_france_in_raw_affiliations(workflow)
        assert result

    def test_check_if_france_in_fulltext_when_france_in_text_body(self, datadir):
        filename = datadir / "grobid_response_fulltext.txt"
        fulltext = filename.read_text()
        france_in_fulltext = workflows.check_if_france_in_fulltext(fulltext)

        assert france_in_fulltext

    def test_check_if_germany_in_affiliations(self):
        data = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [
                            {
                                "value": "Laboratoire de Physique des 2 Infinis Irene "
                                "Joliot-Curie (IJCLab), CNRS, Université "
                                "Paris-Saclay, Orsay, 91405, Germany"
                            }
                        ],
                    }
                ]
            }
        }

        result = workflows.check_if_germany_in_raw_affiliations(data)
        assert result

    def test_check_if_deutschland_in_affiliations(self):
        data = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [
                            {
                                "value": "Laboratoire de Physique des 2 Infinis "
                                "Irene Joliot-Curie (IJCLab), CNRS, Université "
                                "Paris-Saclay, Orsay, 91405, Deutschland"
                            }
                        ],
                    }
                ]
            }
        }

        result = workflows.check_if_germany_in_raw_affiliations(data)
        assert result

    def test_check_if_germany_in_fulltext_when_germany_in_text_body(self):
        fake_grobid_response = '<country key="DE">Germany</country>'
        germany_in_fulltext = workflows.check_if_germany_in_fulltext(
            fake_grobid_response
        )

        assert germany_in_fulltext

    def test_check_if_germany_in_fulltext_when_deutschland_in_text_body(self):
        fake_grobid_response = '<country key="DE">Deutschland</country>'
        germany_in_fulltext = workflows.check_if_germany_in_fulltext(
            fake_grobid_response
        )

        assert germany_in_fulltext

    def test_check_if_uk_in_fulltext(self):
        fake_grobid_response = '<country key="UK">England</country>'
        uk_in_fulltext = workflows.check_if_uk_in_fulltext(fake_grobid_response)

        assert uk_in_fulltext

    def test_check_if_uk_in_fulltext_case_insensitive(self):
        fake_grobid_response = "<country>unitEd KiNgdOm</country>"
        uk_in_fulltext = workflows.check_if_uk_in_fulltext(fake_grobid_response)

        assert uk_in_fulltext

    def test_check_if_uk_in_affiliations(self):
        workflow = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [
                            {
                                "value": "Lorem ipsum dolor sit amet, "
                                "consetetur sadipscing elitr, sed diam, 91405, UK"
                            }
                        ],
                    }
                ]
            }
        }

        result = workflows.check_if_uk_in_raw_affiliations(workflow)
        assert result
        workflow = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [
                            {
                                "value": "Lorem ipsum dolor united kingdom amet, "
                                "consetetur sadipscing elitr, sed diam, 91405"
                            }
                        ],
                    }
                ]
            }
        }
        result = workflows.check_if_uk_in_raw_affiliations(workflow)
        assert result
        workflow = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [
                            {
                                "value": "Lorem ipsum dolor sit amet, "
                                "Scotland sadipscing elitr, sed diam, 91405"
                            }
                        ],
                    }
                ]
            }
        }
        result = workflows.check_if_uk_in_raw_affiliations(workflow)
        assert result
        workflow = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [
                            {
                                "value": "Lorem engLand dolor sit amet, "
                                "sadipscing elitr, sed diam, 91405"
                            }
                        ],
                    }
                ]
            }
        }
        result = workflows.check_if_uk_in_raw_affiliations(workflow)
        assert result
        workflow = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [
                            {
                                "value": "Lorem ipsum dolor sit amet, "
                                "Northern ireland, sed diam, 91405"
                            }
                        ],
                    }
                ]
            }
        }
        result = workflows.check_if_uk_in_raw_affiliations(workflow)
        assert result

    def test_get_curation_ticket_context(self):
        data = {
            "acquisition_source": {"email": "test@example.com"},
            "control_number": 1234,
        }

        curation_context = workflows.get_curation_ticket_context(
            data, InspireHttpHook()
        )

        assert curation_context["recid"] == 1234
        assert curation_context["email"] == "test@example.com"
        assert "record/1234" in curation_context["record_url"]

    def test_get_curation_ticket_subject(self):
        data = {
            "control_number": 1234,
            "report_numbers": [{"value": "CERN-TH-2024-001"}, {"value": "DESY-24-045"}],
            "dois": [{"value": "10.1234/abcd.efgh"}, {"value": "10.5678/wxyz.ijkl"}],
            "arxiv_eprints": [{"value": "2504.01123"}, {"value": "2504.06789"}],
        }

        subject = workflows.get_curation_ticket_subject(data)

        assert (
            subject == "arXiv:2504.01123 arXiv:2504.06789 doi:10.1234/abcd.efgh "
            "doi:10.5678/wxyz.ijkl CERN-TH-2024-001 DESY-24-045 (#1234)"
        )

    def test_get_reply_curation_context(self):
        metadata = {
            "acquisition_source": {"email": "user.test@cern.ch"},
            "control_number": 123456,
            "titles": [{"title": "This article has a reply", "source": "submitter"}],
        }

        workflows.get_reply_curation_context(metadata, InspireHttpHook())

    def test_check_if_cern_candidate(self):
        workflow = {
            "data": {
                "external_system_identifiers": [
                    {"schema": "CDS", "value": "some-id"},
                ]
            }
        }
        assert not workflows.check_if_cern_candidate(workflow)

        workflow = {
            "data": {"_private_notes": [{"value": "Not CERN, but in fermilab"}]}
        }
        assert not workflows.check_if_cern_candidate(workflow)

        workflow = {"data": {"_collections": ["CDS Hidden"]}}
        assert not workflows.check_if_cern_candidate(workflow)

        workflow = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "affiliations": [{"value": "Cape Town UCT-CERN Res. Ctr."}],
                    }
                ]
            }
        }
        assert not workflows.check_if_cern_candidate(workflow)

        workflow = {
            "data": {
                "collaborations": [
                    {"value": "D0"},
                ]
            }
        }
        assert not workflows.check_if_cern_candidate(workflow)

        workflow = {"data": {"corporate_author": ["CERN ATLAS Collaboration"]}}
        assert workflows.check_if_cern_candidate(workflow)
        workflow = {
            "data": {
                "authors": [
                    {
                        "full_name": "author 1",
                        "affiliations": [{"value": "CERN, Geneva, Switzerland"}],
                    }
                ]
            }
        }
        assert workflows.check_if_cern_candidate(workflow)

        workflow = {
            "data": {
                "supervisors": [
                    {
                        "affiliations": [{"value": "CERN, Geneva, Switzerland"}],
                    }
                ]
            }
        }
        assert workflows.check_if_cern_candidate(workflow)

        workflow = {"data": {"report_numbers": [{"value": "CERN-TH-2024-001"}]}}
        assert workflows.check_if_cern_candidate(workflow)

        workflow = {"data": {"collaborations": [{"value": "NA62"}]}}
        assert workflows.check_if_cern_candidate(workflow)

        workflow = {"data": {"accelerator_experiments": [{"legacy_name": "CLIC"}]}}
        assert workflows.check_if_cern_candidate(workflow)

        workflow = {"data": {"collaborations": [{"value": "ALICE"}]}}
        assert workflows.check_if_cern_candidate(workflow)

    @pytest.mark.vcr
    def test_save_workflow(self):
        workflow_data = {
            "id": "00000000-0000-0000-0000-000000001111",
            "data": {
                "titles": [{"title": "test_1"}],
                "abstracts": [
                    {
                        "value": (
                            "We present a comprehensive study of Higgs boson"
                            " production mechanisms in high-energy particle collisions."
                        )
                    }
                ],
                "document_type": [
                    "article",
                ],
                "_collections": ["Literature"],
            },
            "workflow_type": HEP_CREATE,
        }

        result = workflows.save_workflow(workflow_data, HEP)

        assert result["data"] == workflow_data["data"]

    @pytest.mark.vcr
    def test_is_pdf_link_handles_pdfs_starting_with_blank_lines(self):
        assert workflows.is_pdf_link("https://arxiv.org/pdf/1803.01183.pdf")

    @pytest.mark.vcr
    def test_is_pdf_link_handles_different_pdfs_correctly(self):
        assert workflows.is_pdf_link("http://arxiv.org/pdf/physics/0404071")

    @pytest.mark.vcr
    def test_is_pdf_link_from_response(self):
        arxiv_hook = GenericHttpHook(http_conn_id="arxiv_connection")

        endpoint = "/pdf/physics/0404071"

        response = arxiv_hook.call_api(
            endpoint=endpoint,
            extra_options={"stream": True, "allow_redirects": True},
        )

        assert workflows.is_pdf_link(response)
