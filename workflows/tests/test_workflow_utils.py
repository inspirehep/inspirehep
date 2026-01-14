import pytest
from hooks.inspirehep.inspire_http_hook import (
    InspireHttpHook,
)
from include.utils import s3, workflows
from inspire_schemas.api import load_schema, validate

from tests.test_utils import function_test, task_test


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
def test_get_source_root(source, expected_source):
    result = workflows.get_source_for_root(source)

    assert expected_source == result


def test_set_flag():
    workflow_data = {}
    workflows.set_flag("test_flag", True, workflow_data)
    assert workflow_data["flags"]["test_flag"] is True


def test_get_flag():
    workflow_data = {"flags": {"test_flag": True}}
    flag_value = workflows.get_flag("test_flag", workflow_data)
    assert flag_value is True


def test_build_matching_workflow_filter_params():
    workflow_data = {
        "data": {
            "arxiv_eprints": [{"value": "1234.5678"}, {"value": "2345.6789"}],
            "dois": [{"value": "10.1000/xyz123"}],
        }
    }
    statuses = ["pending", "rejected"]
    filter_params = workflows.build_matching_workflow_filter_params(
        workflow_data, statuses
    )

    assert filter_params["status__in"] == {"pending__rejected"}
    assert "search" in filter_params
    assert "data.arxiv_eprints.value.keyword:1234.5678" in filter_params["search"]
    assert "data.arxiv_eprints.value.keyword:2345.6789" in filter_params["search"]
    assert "data.dois.value.keyword:10.1000/xyz123" in filter_params["search"]


def test_has_same_source():
    workflow_1 = {"data": {"acquisition_source": {"source": "Publisher"}}}
    workflow_2 = {"data": {"acquisition_source": {"source": "publisher"}}}
    assert workflows.has_same_source(workflow_1, workflow_2) is True

    workflow_3 = {"data": {"acquisition_source": {"source": "arXiv"}}}
    assert workflows.has_same_source(workflow_1, workflow_3) is False


@pytest.mark.vcr
def test_has_previously_rejected_wf_in_backoffice_w_same_source_true():
    workflow_data = {
        "data": {
            "acquisition_source": {"source": "arXiv"},
            "arxiv_eprints": [{"value": "2504.01123"}],
        }
    }

    result = function_test(
        workflows.has_previously_rejected_wf_in_backoffice_w_same_source,
        params={"workflow_data": workflow_data},
    )
    assert result is True


@pytest.mark.vcr
def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_no_identifier():
    workflow_data = {"data": {"acquisition_source": {"source": "arXiv"}}}

    result = function_test(
        workflows.has_previously_rejected_wf_in_backoffice_w_same_source,
        params={"workflow_data": workflow_data},
    )

    assert result is False


@pytest.mark.vcr
def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_no_rejection():
    workflow_data = {
        "data": {
            "acquisition_source": {"source": "arXiv"},
            "arxiv_eprints": [{"value": "2507.26819"}],
        }
    }

    result = function_test(
        workflows.has_previously_rejected_wf_in_backoffice_w_same_source,
        params={"workflow_data": workflow_data},
    )
    assert result is False


@pytest.mark.vcr
def test_has_previously_rejected_wf_in_backoffice_w_same_source_false_diff_source():
    workflow_data = {
        "data": {
            "acquisition_source": {"source": "bad_source"},
            "arxiv_eprints": [{"value": "2504.01123"}],
        }
    }

    result = function_test(
        workflows.has_previously_rejected_wf_in_backoffice_w_same_source,
        params={"workflow_data": workflow_data},
    )
    assert result is False


def test_is_arxiv_paper_returns_false_if_acquision_source_is_not_present():
    assert not workflows.is_arxiv_paper({})


def test_is_arxiv_paper_returns_false_if_method_is_not_hepcrawl_or_arxiv():
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


def test_is_arxiv_paper_for_submission():
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


def test_is_arxiv_paper_returns_false_when_no_arxiv_eprints_in_submission():
    schema = load_schema("hep")
    subschema = schema["properties"]["acquisition_source"]

    data = {
        "acquisition_source": {
            "method": "submitter",
        },
    }
    assert validate(data["acquisition_source"], subschema) is None

    assert not workflows.is_arxiv_paper(data)


def test_is_arxiv_paper_for_hepcrawl():
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


def test_is_arxiv_paper_ignores_case_for_hepcrawl():
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


def test_is_arxiv_paper_returns_false_if_source_is_not_arxiv_for_hepcrawl():
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


def test_is_arxiv_paper_returns_false_if_source_is_not_present_for_hepcrawl():
    schema = load_schema("hep")
    subschema = schema["properties"]["acquisition_source"]

    data = {
        "acquisition_source": {
            "method": "hepcrawl",
        },
    }
    assert validate(data["acquisition_source"], subschema) is None

    assert not workflows.is_arxiv_paper(data)


@pytest.mark.usefixtures("_s3_hook")
class GrobidTests:
    workflow_id = "bf92a2c3-610c-4d9e-bb8f-5a20d519accc"

    workflow = {
        "id": workflow_id,
        "data": {
            "documents": [
                {"key": "2601.07092.pdf", "url": "https://arxiv.org/pdf/2601.07092"}
            ]
        },
    }

    @pytest.mark.vcr
    def test_post_pdf_to_grobid_process_header(self):
        def _test_post_pdf_to_grobid_process_header():
            s3.write_workflow(self.s3_hook, self.workflow, self.bucket_name)
            task_test(
                "hep_create_dag",
                "preprocessing.download_documents",
                dag_params={"workflow_id": self.workflow_id},
            )
            grobid_response = workflows.post_pdf_to_grobid(
                self.workflow, self.s3_hook, self.bucket_name, process_fulltext=False
            )
            assert '<forename type="first">Yuliang</forename>' in grobid_response.text

        function_test(_test_post_pdf_to_grobid_process_header, params={})

    @pytest.mark.vcr
    def test_post_pdf_to_grobid_process_fulltext(self):
        def _test_post_pdf_to_grobid_process_fulltext():
            s3.write_workflow(self.s3_hook, self.workflow, self.bucket_name)
            task_test(
                "hep_create_dag",
                "preprocessing.download_documents",
                dag_params={"workflow_id": self.workflow_id},
            )
            grobid_response = workflows.post_pdf_to_grobid(
                self.workflow, self.s3_hook, self.bucket_name, process_fulltext=True
            )
            assert (
                "Autonomous driving increasingly relies on Visual Question Answering"
                in grobid_response.text
            )

        function_test(_test_post_pdf_to_grobid_process_fulltext, params={})

    @pytest.mark.vcr
    def test_get_fulltext(self):
        def _test_get_fulltext():
            s3.write_workflow(self.s3_hook, self.workflow, self.bucket_name)
            task_test(
                "hep_create_dag",
                "preprocessing.download_documents",
                dag_params={"workflow_id": self.workflow_id},
            )
            fulltext = workflows.get_fulltext(
                self.workflow, self.s3_hook, self.bucket_name
            )
            assert (
                "Autonomous driving increasingly relies on Visual Question Answering"
                in fulltext
            )

        function_test(_test_get_fulltext, params={})


def test_check_if_france_in_fulltext_when_france_in_header(datadir):
    filename = datadir / "grobid_authors_full_response.txt"
    fulltext = filename.read_text()

    france_in_fulltext = workflows.check_if_france_in_fulltext(fulltext)

    assert france_in_fulltext


def test_check_if_france_in_fulltext_doesnt_include_francesco():
    fake_grobid_response = "<author>Francesco, Papa</author>"

    france_in_fulltext = workflows.check_if_france_in_fulltext(fake_grobid_response)

    assert not france_in_fulltext


def test_check_if_france_in_affiliations():
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


def test_check_if_france_in_fulltext_when_france_in_text_body(datadir):
    filename = datadir / "grobid_response_fulltext.txt"
    fulltext = filename.read_text()
    france_in_fulltext = workflows.check_if_france_in_fulltext(fulltext)

    assert france_in_fulltext


def test_check_if_germany_in_affiliations():
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


def test_check_if_deutschland_in_affiliations():
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


def test_check_if_germany_in_fulltext_when_germany_in_text_body():
    fake_grobid_response = '<country key="DE">Germany</country>'
    germany_in_fulltext = workflows.check_if_germany_in_fulltext(fake_grobid_response)

    assert germany_in_fulltext


def test_check_if_germany_in_fulltext_when_deutschland_in_text_body():
    fake_grobid_response = '<country key="DE">Deutschland</country>'
    germany_in_fulltext = workflows.check_if_germany_in_fulltext(fake_grobid_response)

    assert germany_in_fulltext


def test_check_if_uk_in_fulltext():
    fake_grobid_response = '<country key="UK">England</country>'
    uk_in_fulltext = workflows.check_if_uk_in_fulltext(fake_grobid_response)

    assert uk_in_fulltext


def test_check_if_uk_in_fulltext_case_insensitive():
    fake_grobid_response = "<country>unitEd KiNgdOm</country>"
    uk_in_fulltext = workflows.check_if_uk_in_fulltext(fake_grobid_response)

    assert uk_in_fulltext


def test_check_if_uk_in_affiliations():
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


def test_get_curation_ticket_context():
    def _test_get_curation_ticket_context():
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

    function_test(_test_get_curation_ticket_context)


def test_get_curation_ticket_subject():
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
