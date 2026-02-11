import copy
from unittest import mock
from unittest.mock import patch
from urllib.parse import urlparse

import pytest
from airflow.exceptions import AirflowException, AirflowFailException
from airflow.models import DagBag
from botocore.exceptions import ClientError
from include.utils import s3, workflows
from include.utils.constants import (
    DECISION_AUTO_ACCEPT_CORE,
    DECISION_AUTO_REJECT,
    DECISION_CORE_SELECTION_ACCEPT,
    DECISION_CORE_SELECTION_ACCEPT_CORE,
    DECISION_DISCARD,
    DECISION_HEP_ACCEPT_CORE,
    DECISION_HEP_REJECT,
    HEP_CREATE,
    HEP_UPDATE,
    LITERATURE_PID_TYPE,
    STATUS_APPROVAL,
    STATUS_APPROVAL_CORE_SELECTION,
    STATUS_APPROVAL_FUZZY_MATCHING,
    STATUS_COMPLETED,
    STATUS_RUNNING,
    TICKET_HEP_CURATION_CORE,
    TICKET_HEP_SUBMISSION,
)
from include.utils.tickets import get_ticket_by_type
from include.utils.workflows import get_flag
from inspire_schemas.api import load_schema, validate
from inspire_utils.query import ordered

from tests.test_utils import (
    function_test,
    get_inspire_http_record,
    get_lit_workflow_task,
    set_lit_workflow_task,
    task_test,
)

dagbag = DagBag()

HIGGS_ONTOLOGY = """<?xml version="1.0" encoding="UTF-8" ?>

<rdf:RDF xmlns="http://www.w3.org/2004/02/skos/core#"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">

    <Concept rdf:about="http://cern.ch/thesauri/HEPontology.rdf#Higgsparticle">
        <prefLabel xml:lang="en">Higgs particle</prefLabel>
        <altLabel xml:lang="en">Higgs boson</altLabel>
        <hiddenLabel xml:lang="en">Higgses</hiddenLabel>
        <note xml:lang="en">core</note>
    </Concept>
    <Concept rdf:about="http://cern.ch/thesauri/HEPontology.rdf#Corekeyword">
        <prefLabel xml:lang="en">Core Keyword</prefLabel>
        <note xml:lang="en">core</note>
    </Concept>

</rdf:RDF>
"""


@pytest.fixture
def higgs_ontology(tmpdir):
    ontology = tmpdir.join("HEPont.rdf")
    ontology.write(HIGGS_ONTOLOGY)
    return str(ontology)


@pytest.mark.usefixtures("_s3_hook", "_inspire_http_record_management_hook")
class Test_HEPCreateDAG:
    dag = dagbag.get_dag("hep_create_dag")
    context = {
        "dag_run": {"run_id": "test_run"},
        "ti": {"xcom_push": lambda key, value: None},
        "params": {"workflow_id": "00000000-0000-0000-0000-000000001111"},
    }

    workflow_id = context["params"]["workflow_id"]

    def test_check_env(self):
        task = self.dag.get_task("check_env")

        with mock.patch.dict("os.environ", AIRFLOW_VAR_ENVIRONMENT="DEV"):
            task.execute(context={})

        with (
            mock.patch.dict("os.environ", AIRFLOW_VAR_ENVIRONMENT="PROD"),
            pytest.raises(AirflowException),
        ):
            task.execute(context={})

    @pytest.mark.vcr
    def test_set_schema(self):
        workflow_data = {
            "id": self.workflow_id,
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
            "status": STATUS_RUNNING,
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        task_test("hep_create_dag", "set_schema", dag_params=self.context["params"])
        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, workflow_id=self.workflow_id
        )

        assert "$schema" in workflow_result["data"]

    @pytest.mark.vcr
    def test_get_workflow_data(self):
        res = task_test(
            "hep_create_dag", "get_workflow_data", dag_params=self.context["params"]
        )
        assert res == f"{self.workflow_id}/workflow.json"

    @patch(
        "include.utils.workflows.find_matching_workflows",
        return_value=[
            {
                "id": "to_discard",
                "data": {
                    "acquisition_source": {
                        "method": "hepcrawl",
                        "source": "arXiv",
                    },
                    "arxiv_eprints": [
                        {
                            "value": "2601.19892",
                        }
                    ],
                },
                "_created_at": "2025-11-01T00:00:00.000Z",
            }
        ],
    )
    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.discard_workflow"
    )
    def test_discard_older_wfs_w_same_source_discard_other(
        self, mock_discard_workflow, mock_find_matching_workflows
    ):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "acquisition_source": {
                        "method": "hepcrawl",
                        "source": "arXiv",
                        "datetime": "2025-10-28T02:00:33.403192",
                        "submission_number": "scheduled__2025-10-28T02:00:00+00:00",
                    },
                    "arxiv_eprints": [
                        {
                            "value": "2601.19892",
                        }
                    ],
                },
                "_created_at": "2025-11-02T00:00:00.000Z",
            },
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "discard_older_wfs_w_same_source",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "check_for_blocking_workflows" in result["followed"]

    @patch(
        "include.utils.workflows.find_matching_workflows",
        return_value=[
            {
                "id": "to_discard",
                "data": {
                    "acquisition_source": {
                        "method": "hepcrawl",
                        "source": "arXiv",
                    },
                    "arxiv_eprints": [
                        {
                            "value": "2601.19892",
                        }
                    ],
                },
                "_created_at": "2025-11-03T00:00:00.000Z",
            }
        ],
    )
    @pytest.mark.vcr
    def test_discard_older_wfs_w_same_source_discard_self(
        self, mock_find_matching_workflows
    ):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "acquisition_source": {
                        "method": "hepcrawl",
                        "source": "arXiv",
                        "datetime": "2025-10-28T02:00:33.403192",
                        "submission_number": "scheduled__2025-10-28T02:00:00+00:00",
                    },
                    "arxiv_eprints": [
                        {
                            "value": "2601.19892",
                        }
                    ],
                },
                "_created_at": "2025-11-02T00:00:00.000Z",
            },
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "discard_older_wfs_w_same_source",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )
        assert "run_next_if_necessary" in result["followed"]
        workflow_result = get_lit_workflow_task(self.workflow_id)

        assert workflow_result["status"] == STATUS_COMPLETED
        assert workflows.get_decision(workflow_result["decisions"], DECISION_DISCARD)

    @patch(
        "include.utils.workflows.find_matching_workflows",
        return_value=[
            {
                "id": "to_discard",
                "data": {
                    "acquisition_source": {
                        "method": "submitter",
                        "source": "submitter",
                    },
                    "arxiv_eprints": [
                        {
                            "value": "2601.19892",
                        }
                    ],
                },
                "_created_at": "2025-11-03T00:00:00.000Z",
            }
        ],
    )
    def test_discard_older_wfs_w_same_source_discard_double_submission(
        self, mock_find_matching_workflows
    ):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "acquisition_source": {
                        "method": "submitter",
                        "source": "submitter",
                        "datetime": "2025-10-28T02:00:33.403192",
                    },
                    "arxiv_eprints": [
                        {
                            "value": "2601.19892",
                        }
                    ],
                },
                "_created_at": "2025-11-02T00:00:00.000Z",
            },
            self.bucket_name,
        )

        with pytest.raises(AirflowFailException):
            task_test(
                "hep_create_dag",
                "discard_older_wfs_w_same_source",
                dag_params=self.context["params"],
            )

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_block_arxivid(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "2507.26819",
                        }
                    ],
                },
            },
            self.bucket_name,
        )

        assert not task_test(
            "hep_create_dag",
            "check_for_blocking_workflows",
            dag_params=self.context["params"],
        )

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_block_doi(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "dois": [
                        {
                            "value": "10.1103/fc8j-tb8k",
                        }
                    ],
                },
            },
            self.bucket_name,
        )
        assert not task_test(
            "hep_create_dag",
            "check_for_blocking_workflows",
            dag_params=self.context["params"],
        )

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_continue(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "xxx",
                        }
                    ],
                },
            },
            self.bucket_name,
        )
        assert task_test(
            "hep_create_dag",
            "check_for_blocking_workflows",
            dag_params=self.context["params"],
        )
        assert get_lit_workflow_task(self.workflow_id)["status"] == STATUS_RUNNING

    @pytest.mark.vcr
    def test_check_for_exact_matches_no_match(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "arxiv_eprints": [{"value": "1801.00000"}],
                },
            },
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "check_for_exact_matches",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "check_for_fuzzy_matches" in result["followed"]

    def test_check_auto_approve_is_submission(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "A title"}],
                "acquisition_source": {"method": "submitter"},
            },
        }

        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )

        task_test(
            "hep_create_dag",
            "check_auto_approve",
            dag_params=self.context["params"],
        )

        result = s3.read_workflow(
            self.s3_hook,
            self.bucket_name,
            self.workflow_id,
        )

        assert result["flags"]["auto-approved"] is False

    @pytest.mark.vcr
    def test_check_auto_approve_is_auto_approved_and_core_is_true(self):
        workflow_data = {
            "flags": {
                "is-update": False,
            },
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "A title"}],
                "acquisition_source": {"method": "submitter"},
                "arxiv_eprints": [
                    {
                        "categories": [
                            "hep-ph",
                            "astro-ph.CO",
                            "gr-qc",
                        ],
                        "value": "1609.03939",
                    },
                ],
            },
        }
        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )
        task_test(
            "hep_create_dag",
            "check_auto_approve",
            dag_params=self.context["params"],
        )
        result = s3.read_workflow(
            self.s3_hook,
            self.bucket_name,
            self.workflow_id,
        )

        assert result["core"] is True
        assert result["flags"]["auto-approved"] is True

        workflow = get_lit_workflow_task(self.workflow_id)
        assert workflows.get_decision(
            workflow.get("decisions"), DECISION_AUTO_ACCEPT_CORE
        )

    def test_check_auto_approve_is_auto_approved_and_no_core_set(self):
        workflow_data = {
            "flags": {
                "is-update": True,
            },
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "A title"}],
                "acquisition_source": {"method": "submitter"},
                "arxiv_eprints": [
                    {
                        "categories": [
                            "hep-ph",
                            "astro-ph.CO",
                            "gr-qc",
                        ],
                        "value": "1609.03939",
                    },
                ],
            },
        }

        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )

        task_test(
            "hep_create_dag",
            "check_auto_approve",
            dag_params=self.context["params"],
        )

        result = s3.read_workflow(
            self.s3_hook,
            self.bucket_name,
            self.workflow_id,
        )

        assert "core" not in result
        assert result["flags"]["auto-approved"] is True

    @pytest.mark.vcr
    def test_check_if_previously_rejected_true(self):
        workflow_data = {
            "flags": {
                "is-update": False,
                "auto-approved": False,
            },
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "A title"}],
                "arxiv_eprints": [{"value": "2504.01123"}],
                "acquisition_source": {
                    "source": "arXiv",
                },
            },
        }
        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "check_if_previously_rejected",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )
        workflow = get_lit_workflow_task(self.workflow_id)

        assert "save_and_complete_workflow" in result["followed"]
        assert workflows.get_decision(workflow.get("decisions"), DECISION_AUTO_REJECT)

    @pytest.mark.vcr
    def test_check_if_previously_rejected_false(self):
        workflow_data = {
            "flags": {
                "is-update": False,
                "auto-approved": False,
            },
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "A title"}],
                "arxiv_eprints": [{"value": "2504.01123"}],
                "acquisition_source": {
                    "source": "custom_source",
                },
            },
        }
        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "check_if_previously_rejected",
            dag_params=self.context["params"],
        )
        assert result == "preprocessing"

    @pytest.mark.vcr
    def test_check_for_exact_matches_one_match(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "arxiv_eprints": [{"value": "1801.07224"}],
                },
            },
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "check_for_exact_matches",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "stop_if_existing_submission_notify_and_close" in result["followed"]

    @pytest.mark.vcr
    def test_check_for_exact_matches_one_match_has_match(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "arxiv_eprints": [{"value": "1801.07224"}],
                },
            },
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "check_for_exact_matches",
            dag_params=self.context["params"],
            xcom_key="match",
        )

        assert result == 1649231

    @pytest.mark.vcr
    def test_check_for_exact_matches_multi_match(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "dois": [
                        {"value": "10.1103/PhysRevD.95.094515", "source": "APS"},
                        {"value": "10.1103/PhysRevD.95.094515"},
                    ],
                    "arxiv_eprints": [
                        {"value": "1601.03071", "categories": ["hep-lat", "hep-ph"]}
                    ],
                },
            },
            self.bucket_name,
        )

        with pytest.raises(AirflowException):
            task_test(
                "hep_create_dag",
                "check_for_exact_matches",
                dag_params=self.context["params"],
            )

    @pytest.mark.vcr
    def test_check_for_fuzzy_matches_matches(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {
                        "title": "Hadronic contributions to the muon anomalous magnetic"
                        " moment Workshop."
                        " $(g-2)_{\\mu}$: Quo vadis? Workshop. Mini proceedings",
                        "source": "arXiv",
                    }
                ],
            },
        }
        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )

        result = task_test(
            dag_id="hep_create_dag",
            task_id="check_for_fuzzy_matches",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, workflow_id=self.workflow_id
        )

        assert len(workflow_result["matches"]["fuzzy"])
        assert result == "await_decision_fuzzy_match"

    @pytest.mark.vcr
    def test_check_for_fuzzy_matches_no_matches(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {"title": "xyzabc random title with no match", "source": "arXiv"}
                ],
            },
        }
        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )

        result = task_test(
            dag_id="hep_create_dag",
            task_id="check_for_fuzzy_matches",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert result == {"followed": ["stop_if_existing_submission_notify_and_close"]}

    @pytest.mark.vcr
    def test_await_decision_fuzzy_match_best_match(self):
        assert task_test(
            dag_id="hep_create_dag",
            task_id="await_decision_fuzzy_match",
            dag_params=self.context["params"],
        )
        assert get_lit_workflow_task(self.workflow_id)["status"] == STATUS_RUNNING

    @pytest.mark.vcr
    def test_await_decision_fuzzy_match_best_match_no_decision(self):
        workflow_id = "6e84fd0b-8d0b-4147-9aee-c28a4f787b0d"

        set_lit_workflow_task(status_name=STATUS_RUNNING, workflow_id=workflow_id)

        assert not task_test(
            dag_id="hep_create_dag",
            task_id="await_decision_fuzzy_match",
            dag_params={"workflow_id": workflow_id},
        )
        assert (
            get_lit_workflow_task(workflow_id)["status"]
            == STATUS_APPROVAL_FUZZY_MATCHING
        )

    @pytest.mark.vcr
    def test_await_decision_fuzzy_match_best_match_has_xcom_match(self):
        result = task_test(
            dag_id="hep_create_dag",
            task_id="await_decision_fuzzy_match",
            dag_params=self.context["params"],
            xcom_key="match",
        )

        assert result == "paper1"

    @pytest.mark.vcr
    def test_await_decision_fuzzy_match_none(self):
        assert task_test(
            dag_id="hep_create_dag",
            task_id="await_decision_fuzzy_match",
            dag_params={"workflow_id": "66961888-a628-46b7-b807-4deae3478adc"},
        )

    def test_stop_if_existing_submission_notify_and_close_continue(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "A title"}],
            },
            "flags": {"is-update": False},
        }

        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "stop_if_existing_submission_notify_and_close",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "check_auto_approve" in result["followed"]

    @pytest.mark.vcr
    def test_stop_if_existing_submission_notify_and_close_stop(self):
        workflow_id = "4100e6f4-1bd6-4bbe-b0b4-864c6c2cbef2"

        workflow_data = get_lit_workflow_task(workflow_id)
        workflow_data["flags"] = {"is-update": True}
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_if_submission",
            dag_params={"workflow_id": workflow_id},
        )

        s3.write_workflow(
            self.s3_hook,
            get_lit_workflow_task(workflow_id),
            self.bucket_name,
        )

        result = task_test(
            "hep_create_dag",
            "stop_if_existing_submission_notify_and_close",
            dag_params={"workflow_id": workflow_id},
            xcom_key="skipmixin_key",
        )

        assert "save_and_complete_workflow" in result["followed"]

    @pytest.mark.vcr
    def test_normalize_collaborations(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "collaborations": [{"value": "ETM"}],
                "acquisition_source": {"submission_number": "123"},
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.normalize_collaborations",
            dag_params={"workflow_id": self.workflow_id},
        )

        workflow_result = s3.read_workflow(
            self.s3_hook,
            self.bucket_name,
            self.workflow_id,
        )
        accelerator_experiments = workflow_result["data"]["accelerator_experiments"]

        assert "record" in accelerator_experiments[0]
        assert accelerator_experiments[0]["legacy_name"] == "LATTICE-ETM"
        assert workflow_data["data"]["collaborations"][0]["value"] == "ETM"

    @pytest.mark.vcr
    def test_extract_journal_info(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "publication_info": [
                    {"pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970"},
                    {"pubinfo_freetext": "Phys.Rev.Lett. 127 (1962) 965-970"},
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.extract_journal_info",
            dag_params=self.context["params"],
        )

        updated = s3.read_workflow(
            self.s3_hook, self.bucket_name, workflow_id=self.workflow_id
        )
        assert "refextract" in updated
        assert len(updated["refextract"]) == 2

        expected = [
            {
                "pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970",
                "journal_title": "Phys.Rev.",
                "journal_volume": "127",
                "page_start": "965",
                "page_end": "970",
                "year": 1962,
            },
            {
                "pubinfo_freetext": "Phys.Rev.Lett. 127 (1962) 965-970",
                "journal_title": "Phys.Rev.Lett.",
                "journal_volume": "127",
                "page_start": "965",
                "page_end": "970",
                "year": 1962,
            },
        ]
        assert len(updated["data"]["publication_info"]) == 2
        assert updated["data"]["publication_info"] == expected

    def test_arxiv_package_download(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "2508.17630",
                        }
                    ],
                },
            },
            self.bucket_name,
        )
        res = task_test(
            "hep_create_dag",
            "preprocessing.arxiv_package_download",
            dag_params=self.context["params"],
        )
        assert res == f"{self.workflow_id}/2508.17630.tar.gz"

    def test_arxiv_author_list_with_missing_tarball(self):
        schema = load_schema("hep")
        eprints_subschema = schema["properties"]["arxiv_eprints"]
        workflow_data = {
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "hep-ex",
                        ],
                        "value": "1703.09986",
                    },
                ],
            }
        }  # record/1519995
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "2508.17630",
                        }
                    ],
                },
            },
            self.bucket_name,
        )
        validate(workflow_data["data"]["arxiv_eprints"], eprints_subschema)

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.arxiv_author_list",
            params={"tarball_key": f"{self.workflow_id}/notfound"},
            dag_params=self.context["params"],
        )

    def test_arxiv_author_list_handles_no_author_list(self, datadir):
        tarball_name = "2411.11095.tar.gz"
        tarball_key = f"{self.workflow_id}/{tarball_name}"

        self.s3_hook.load_file(
            datadir / tarball_name,
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "authors": [
                    {"full_name": "Chen, Yin"},
                    {"full_name": "Zhang, Runxuan"},
                ],
            },
        }

        s3.write_workflow(
            self.s3_hook,
            workflow_data,
            self.bucket_name,
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.arxiv_author_list",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert workflow_result["data"]["authors"] == workflow_data["data"]["authors"]

    def test_arxiv_ignores_random_xml_files(self, datadir):
        tarball_name = "2411.11095.tar.gz"
        tarball_key = f"{self.context['params']['workflow_id']}-{tarball_name}"

        self.s3_hook.load_file(
            datadir / tarball_name,
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "authors": [{"full_name": "Chen, Yin"}, {"full_name": "Zhang, Runxuan"}]
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.arxiv_author_list",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert workflow_result["data"]["authors"] == workflow_data["data"]["authors"]

    def test_arxiv_author_list_only_overrides_authors(self, datadir):
        tarball_name = "1703.09986.tar.gz"
        tarball_key = f"{self.context['params']['workflow_id']}-{tarball_name}"

        self.s3_hook.load_file(
            datadir / tarball_name,
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "$schema": "http://localhost:5000/hep.json",
                "arxiv_eprints": [
                    {
                        "categories": [
                            "hep-ex",
                        ],
                        "value": "1703.09986",
                    },
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.arxiv_author_list",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert "arxiv_eprints" in workflow_result["data"]
        assert (
            workflow_result["data"]["arxiv_eprints"]
            == workflow_data["data"]["arxiv_eprints"]
        )
        assert "$schema" in workflow_result["data"]
        assert workflow_result["data"]["$schema"] == workflow_data["data"]["$schema"]
        assert workflow_result["data"]["authors"] != workflow_data["data"].get(
            "authors", []
        )

    def test_arxiv_author_list_handles_multiple_author_xml_files(self, datadir):
        schema = load_schema("hep")
        eprints_subschema = schema["properties"]["arxiv_eprints"]

        tarball_name = "1703.09986.multiple_author_lists.tar.gz"

        tarball_key = f"{self.workflow_id}/{tarball_name}"

        self.s3_hook.load_file(
            (datadir / tarball_name),
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        data = {
            "$schema": "http://localhost:5000/hep.json",
            "arxiv_eprints": [
                {
                    "categories": [
                        "hep-ex",
                    ],
                    "value": "1703.09986",
                },
            ],
        }  # record/1519995
        validate(data["arxiv_eprints"], eprints_subschema)

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.arxiv_author_list",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        authors_subschema = schema["properties"]["authors"]
        expected_authors = [
            {
                "affiliations": [{"value": "Yerevan Phys. Inst."}],
                "ids": [
                    {"value": "INSPIRE-00312131", "schema": "INSPIRE ID"},
                    {"value": "CERN-432142", "schema": "CERN"},
                ],
                "full_name": "Sirunyan, Albert M.",
            },
            {
                "affiliations": [{"value": "Yerevan Phys. Inst."}],
                "ids": [
                    {"value": "INSPIRE-00312132", "schema": "INSPIRE ID"},
                    {"value": "CERN-432143", "schema": "CERN"},
                ],
                "full_name": "Weary, Jake",
            },
        ]
        validate(expected_authors, authors_subschema)

        assert workflow_result["data"]["authors"] == expected_authors

    def test_arxiv_author_list_does_not_produce_latex(self, datadir):
        schema = load_schema("hep")

        tarball_name = "1802.03388.tar.gz"

        tarball_key = f"{self.workflow_id}/{tarball_name}"

        self.s3_hook.load_file(
            (datadir / tarball_name),
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        eprints_subschema = schema["properties"]["arxiv_eprints"]
        data = {
            "arxiv_eprints": [
                {
                    "categories": [
                        "hep-ex",
                    ],
                    "value": "1802.03388",
                },
            ],
        }
        validate(data["arxiv_eprints"], eprints_subschema)

        authors_subschema = schema["properties"]["authors"]
        expected_authors = [
            {
                "affiliations": [{"value": "Lund U."}],
                "ids": [{"value": "INSPIRE-00061248", "schema": "INSPIRE ID"}],
                "full_name": "Åkesson, Torsten Paul Ake",
            },
        ]
        validate(expected_authors, authors_subschema)
        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.arxiv_author_list",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert workflow_result["data"]["authors"] == expected_authors

    def test_check_is_arxiv_paper(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [{"value": "2508.17630", "categories": ["cs.LG"]}],
                "acquisition_source": {
                    "method": "hepcrawl",
                    "source": "arXiv",
                    "datetime": "2025-08-29T04:01:43.201583",
                    "submission_number": "10260051",
                },
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        res = task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.check_is_arxiv_paper",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "preprocessing.populate_arxiv_document" in res["followed"]

    def test_check_is_not_arxiv_paper(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "acquisition_source": {
                    "method": "not_hepcrawl",
                    "source": "not_arXiv",
                    "datetime": "2025-08-29T04:01:43.201583",
                    "submission_number": "10260051",
                }
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        res = task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.check_is_arxiv_paper",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "preprocessing.populate_submission_document" in res["followed"]

    @pytest.mark.vcr
    def test_populate_journal_coverage(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "publication_info": [
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1214516"
                        }
                    }
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        task_test(
            "hep_create_dag",
            "preprocessing.populate_journal_coverage",
            dag_params=self.context["params"],
        )

        result = s3.read_workflow(self.s3_hook, self.bucket_name, self.workflow_id)
        assert "partial" in result["journal_coverage"]

    @pytest.mark.vcr
    def test_populate_journal_coverage_picks_full_if_exists(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "publication_info": [
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1214516"
                        }
                    },
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1213103"
                        }
                    },
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        task_test(
            "hep_create_dag",
            "preprocessing.populate_journal_coverage",
            dag_params=self.context["params"],
        )

        result = s3.read_workflow(self.s3_hook, self.bucket_name, self.workflow_id)
        assert "full" in result["journal_coverage"]

    def test_arxiv_plot_extract(self, datadir):
        tarball_key = f"{self.workflow_id}/test"
        self.s3_hook.load_file(
            (datadir / "arXiv-2509.06062v1.tar.gz"),
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        workflow_data = {"id": self.workflow_id, "data": {}}

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        task_test(
            "hep_create_dag",
            "preprocessing.arxiv_plot_extract",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        plots = workflow_result["data"]["figures"]
        assert len(plots) == 20
        for plot in plots:
            assert plot["key"].endswith(".png")

    def test_arxiv_plot_extract_populates_files_with_plots(self, datadir):
        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]

        tarball_key = f"{self.workflow_id}/test"
        self.s3_hook.load_file(
            (datadir / "0804.1873.tar.gz"),
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "nucl-ex",
                        ],
                        "value": "0804.1873",
                    },
                ],
            },
        }
        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.arxiv_plot_extract",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        expected = [
            {
                "url": "http://s3:9000/data-store/00000000-0000-0000-0000-000000001111/plots/0_figure1.png",
                "source": "arxiv",
                "material": "preprint",
                "key": "00000000-0000-0000-0000-000000001111/plots/0_figure1.png",
                "caption": "Difference (in MeV) between the theoretical and "
                "experimental masses for the 2027 selected nuclei"
                " as a function of the mass number.",
            }
        ]

        assert (
            urlparse(expected[0]["url"]).path
            == urlparse(workflow_result["data"]["figures"][0]["url"]).path
        )
        for key in ["source", "material", "key", "caption"]:
            assert expected[0][key] == workflow_result["data"]["figures"][0][key]

    def test_arxiv_plot_extract_is_safe_to_rerun(self, datadir):
        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]

        tarball_key = f"{self.workflow_id}/test"
        self.s3_hook.load_file(
            (datadir / "0804.1873.tar.gz"),
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "nucl-ex",
                        ],
                        "value": "0804.1873",
                    },
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None

        for _ in range(2):
            assert (
                task_test(
                    "hep_create_dag",
                    "preprocessing.arxiv_plot_extract",
                    params={"tarball_key": tarball_key},
                    dag_params=self.context["params"],
                )
                is None
            )

            workflow_result = s3.read_workflow(
                self.s3_hook, self.bucket_name, self.workflow_id
            )
            expected_figures = [
                {
                    "url": "http://s3:9000/data-store/00000000-0000-0000-0000-000000001111/plots/0_figure1.png",
                    "source": "arxiv",
                    "material": "preprint",
                    "key": "00000000-0000-0000-0000-000000001111/plots/0_figure1.png",
                    "caption": "Difference (in MeV) between the theoretical and"
                    " experimental masses for the 2027 selected nuclei"
                    " as a function of the mass number.",
                }
            ]

            assert (
                urlparse(expected_figures[0]["url"]).path
                == urlparse(workflow_result["data"]["figures"][0]["url"]).path
            )
            for key in ["source", "material", "key", "caption"]:
                assert (
                    expected_figures[0][key]
                    == workflow_result["data"]["figures"][0][key]
                )

    def test_arxiv_plot_extract_handles_duplicate_plot_names(self, datadir):
        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]

        tarball_key = f"{self.workflow_id}/test"
        self.s3_hook.load_file(
            (datadir / "1711.10662.tar.gz"),
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "cs.CV",
                        ],
                        "value": "1711.10662",
                    },
                ],
            },
        }

        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        task_test(
            "hep_create_dag",
            "preprocessing.arxiv_plot_extract",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert len(workflow_result["data"]["figures"]) == 66

    def test_arxiv_plot_extract_logs_when_tarball_is_invalid(self, datadir):
        tarball_key = f"{self.workflow_id}/test"
        self.s3_hook.load_file(
            (datadir / "1612.00626"),
            tarball_key,
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "physics.ins-det",
                        ],
                        "value": "no.file",
                    },
                ],
                "figures": [],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.arxiv_plot_extract",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert "figures" not in workflow_result["data"]

    def test_arxiv_plot_extract_no_file(self):
        tarball_key = f"{self.workflow_id}/no-file"

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "physics.ins-det",
                        ],
                        "value": "no.file",
                    },
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        with pytest.raises(ClientError, match="Not Found"):
            task_test(
                "hep_create_dag",
                "preprocessing.arxiv_plot_extract",
                params={"tarball_key": tarball_key},
                dag_params=self.context["params"],
            )

    @pytest.mark.vcr
    def test_populate_submission_document(self):
        workflow = {
            "id": self.workflow_id,
            "data": {
                "acquisition_source": {
                    "datetime": "2017-11-30T16:38:43.352370",
                    "email": "david.caro@cern.ch",
                    "internal_uid": 54252,
                    "method": "submitter",
                    "orcid": "0000-0002-2174-4493",
                    "source": "submitter",
                    "submission_number": "1",
                }
            },
            "form_data": {"url": "https://arxiv.org/pdf/1605.03844"},
        }

        s3.write_workflow(self.s3_hook, workflow, self.bucket_name)

        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]

        assert validate(workflow["data"]["acquisition_source"], subschema) is None

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.populate_submission_document",
            dag_params=self.context["params"],
        )

        expected = [
            {
                "fulltext": True,
                "key": "fulltext.pdf",
                "original_url": "https://arxiv.org/pdf/1605.03844",
                "source": "submitter",
                "url": "https://arxiv.org/pdf/1605.03844",
            },
        ]

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert expected == workflow_result["data"]["documents"]

    @pytest.mark.vcr
    def test_populate_submission_document_does_not_duplicate_documents(self):
        workflow = {
            "id": self.workflow_id,
            "data": {
                "acquisition_source": {
                    "datetime": "2017-11-30T16:38:43.352370",
                    "email": "david.caro@cern.ch",
                    "internal_uid": 54252,
                    "method": "submitter",
                    "orcid": "0000-0002-2174-4493",
                    "source": "submitter",
                    "submission_number": "1",
                }
            },
            "form_data": {"url": "https://arxiv.org/pdf/1605.03844"},
        }

        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]

        assert validate(workflow["data"]["acquisition_source"], subschema) is None

        s3.write_workflow(self.s3_hook, workflow, self.bucket_name)

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.populate_submission_document",
            dag_params=self.context["params"],
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.populate_submission_document",
            dag_params=self.context["params"],
        )

        expected = [
            {
                "fulltext": True,
                "key": "fulltext.pdf",
                "original_url": "https://arxiv.org/pdf/1605.03844",
                "source": "submitter",
                "url": "https://arxiv.org/pdf/1605.03844",
            },
        ]

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert expected == workflow_result["data"]["documents"]

    def test_populate_submission_document_without_pdf(self):
        workflow = {
            "id": self.workflow_id,
            "data": {
                "acquisition_source": {
                    "datetime": "2017-11-30T16:38:43.352370",
                    "email": "david.caro@cern.ch",
                    "internal_uid": 54252,
                    "method": "submitter",
                    "orcid": "0000-0002-2174-4493",
                    "source": "submitter",
                    "submission_number": "1",
                },
                "form_data": {"url": "https://inspirehep.net"},
            },
        }

        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]

        assert validate(workflow["data"]["acquisition_source"], subschema) is None

        s3.write_workflow(self.s3_hook, workflow, self.bucket_name)

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.populate_submission_document",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert not workflow_result["data"].get("documents")

    def test_populate_submission_document_without_documents(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["acquisition_source"]
        workflow = {
            "id": self.workflow_id,
            "data": {
                "acquisition_source": {
                    "datetime": "2017-11-30T16:38:43.352370",
                    "email": "david.caro@cern.ch",
                    "internal_uid": 54252,
                    "method": "submitter",
                    "orcid": "0000-0002-2174-4493",
                    "source": "submitter",
                    "submission_number": "1",
                },
                "documents": [],
            },
        }
        assert validate(workflow["data"]["acquisition_source"], subschema) is None

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.populate_submission_document",
            dag_params=self.context["params"],
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.populate_submission_document",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert "documents" not in workflow_result["data"]

    @pytest.mark.vcr
    def test_download_documents(self):
        filename = "1605.03844.pdf"
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "documents": [
                    {
                        "key": filename,
                        "url": "https://arxiv.org/pdf/1605.03844",
                    },
                ],
            },
        }  # literature/1458302

        schema = load_schema("hep")
        subschema = schema["properties"]["documents"]
        assert validate(workflow_data["data"]["documents"], subschema) is None

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.download_documents",
            dag_params=self.context["params"],
        )

        result = s3.read_workflow(self.s3_hook, self.bucket_name, self.workflow_id)

        assert self.s3_hook.check_for_key(
            f"{self.workflow_id}/documents/{filename}", self.bucket_name
        )
        self.s3_hook.delete_objects(
            self.bucket_name, f"{self.workflow_id}/documents/{filename}"
        )

        assert (
            urlparse(result["data"]["documents"][0]["url"]).path
            == f"/{self.bucket_name}/{self.workflow_id}/documents/{filename}"
        )

    @pytest.mark.vcr
    def test_download_documents_with_multiple_documents(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "documents": [
                    {
                        "key": "1605.03845.pdf",
                        "url": "https://arxiv.org/pdf/1605.03845",
                    },
                    {
                        "key": "1605.03849.pdf",
                        "url": "https://arxiv.org/pdf/1605.03849",
                    },
                    {
                        "key": "math_0608330.pdf",
                        "url": "https://arxiv.org/pdf/math/0608330",
                    },
                ],
            },
        }  # literature/1458302

        schema = load_schema("hep")
        subschema = schema["properties"]["documents"]
        assert validate(workflow_data["data"]["documents"], subschema) is None

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.download_documents",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        for document_in, document_out in zip(
            workflow_data["data"]["documents"],
            workflow_result["data"]["documents"],
            strict=False,
        ):
            assert self.s3_hook.check_for_key(
                f"{self.workflow_id}/documents/{document_in['key']}", self.bucket_name
            )
            self.s3_hook.delete_objects(
                self.bucket_name, f"{self.workflow_id}/documents/{document_in['key']}"
            )

            assert (
                urlparse(document_out["url"]).path == f"/{self.bucket_name}/"
                f"{self.workflow_id}/documents/{document_in['key']}"
            )

    @pytest.mark.vcr
    def test_count_reference_coreness(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "references": [
                    {
                        "record": {
                            "$ref": "https://localhost:8080/api/literature/1331798"
                        },
                    },
                    {
                        "record": {
                            "$ref": "https://localhost:8080/api/literature/1325985"
                        },
                    },
                    {
                        "record": {
                            "$ref": "https://localhost:8080/api/literature/1674998"
                        },
                    },
                ]
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        task_test(
            "hep_create_dag",
            "preprocessing.count_reference_coreness",
            dag_params=self.context["params"],
        )

        result = s3.read_workflow(self.s3_hook, self.bucket_name, self.workflow_id)
        assert result["reference_count"]["core"] == 2
        assert result["reference_count"]["non_core"] == 1

    @pytest.mark.vcr
    def test_normalize_journal_titles_with_empty_data(self):
        """Test the normalize_journal_titles Airflow task with
        empty publication_info."""

        workflow_data = {"id": self.workflow_id, "data": {}}

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        assert not task_test(
            "hep_create_dag",
            "preprocessing.normalize_journal_titles",
            dag_params=self.context["params"],
        )

        updated_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert "data" in updated_data
        assert updated_data["data"] == {}

    @pytest.mark.vcr
    def test_populate_arxiv_document(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "hep-th",
                            "hep-ph",
                        ],
                        "value": "1612.08928",
                    },
                ],
            },
        }

        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]
        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.populate_arxiv_document",
            params=None,
            dag_params=self.context["params"],
        )

        workflow_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        expected = [
            {
                "key": "1612.08928.pdf",
                "fulltext": True,
                "hidden": True,
                "material": "preprint",
                "original_url": "https://arxiv.org/pdf/1612.08928",
                "url": "https://arxiv.org/pdf/1612.08928",
                "source": "arxiv",
            },
        ]
        assert workflow_data["data"]["documents"] == expected

    @pytest.mark.vcr
    def test_populate_arxiv_document_does_not_duplicate_files_if_called_multiple_times(
        self,
    ):
        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "physics.ins-det",
                        ],
                        "value": "1605.03844",
                    },
                ],
            },
        }

        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.populate_arxiv_document",
            dag_params=self.context["params"],
        )

        task_test(
            "hep_create_dag",
            "preprocessing.populate_arxiv_document",
            dag_params=self.context["params"],
        )

        workflow_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert len(workflow_data["data"]["documents"]) == 1

    @pytest.mark.vcr
    def test_populate_arxiv_document_logs_on_pdf_not_existing(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "cs.CV",
                        ],
                        "value": "2412.13417",
                    },
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None

        task_test(
            "hep_create_dag",
            "preprocessing.populate_arxiv_document",
            dag_params=self.context["params"],
        )

        workflow_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert "documents" not in workflow_data["data"]

    @pytest.mark.vcr
    def test_normalize_journal_titles_with_data(self):
        """Test the normalize_journal_titles Airflow task with publication_info."""

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "publication_info": [
                    {"journal_title": "Phys. Rev. D"},
                    {"journal_title": "Journal of High Energy Physics"},
                    {"cnum": "C01-01-01"},
                ]
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        assert not task_test(
            "hep_create_dag",
            "preprocessing.normalize_journal_titles",
            dag_params=self.context["params"],
        )

        updated_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert "data" in updated_data
        assert "publication_info" in updated_data["data"]
        assert len(updated_data["data"]["publication_info"]) == 3

        pub_info = updated_data["data"]["publication_info"]
        assert "journal_title" in pub_info[0]
        assert "journal_record" not in pub_info[0]
        assert "journal_title" in pub_info[1]
        assert "journal_record" in pub_info[1]
        assert "cnum" in pub_info[2]

    @pytest.mark.vcr
    def test_refextract_from_raw_refs(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["references"]
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "references": [
                    {
                        "raw_refs": [
                            {
                                "schema": "text",
                                "value": "Iskra \\u0141 W et al 2017 Acta Phys."
                                " Pol. B 48 581",
                            }
                        ]
                    },
                    {
                        "raw_refs": [
                            {
                                "schema": "text",
                                "value": "Iskra \\u0141 W et al 2017 Acta Phys."
                                " Pol. B 48 582",
                            }
                        ]
                    },
                    {
                        "raw_refs": [
                            {
                                "schema": "text",
                                "value": "Iskra \\u0141 W et al 2017 Acta Phys."
                                " Pol. B 48 583",
                            }
                        ]
                    },
                    {
                        "reference": {
                            "publication_info": {
                                "journal_volume": "25",
                                "page_start": "107",
                                "journal_title": "Egypt. J. Pet.",
                                "artid": "107",
                                "year": 2016,
                            },
                            "dois": ["10.1016/j.ejpe.2015.03.011"],
                            "misc": ["2024112816553493200_bib1", "publisher"],
                            "authors": [{"full_name": "Abdel-Shafy"}],
                        }
                    },
                ],
            },
        }

        assert validate(workflow_data["data"]["references"], subschema) is None

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.refextract",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert len(workflow_result["data"]["references"]) == 4
        assert "reference" in workflow_result["data"]["references"][0]

    @pytest.mark.vcr
    def test_refextract_from_s3_pdf(self, datadir):
        filename = "1802.08709.pdf"

        self.s3_hook.load_file(
            datadir / filename,
            f"{self.workflow_id}/documents/{filename}",
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "documents": [
                    {"key": filename},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.refextract",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert len(workflow_result["data"]["references"]) == 50

    @pytest.mark.vcr
    def test_refextract_from_text(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {},
            "form_data": {
                "references": "Iskra Ł W et al 2017 Acta Phys. Pol. B 48 581"
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.refextract",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert len(workflow_result["data"]["references"]) == 1

    @pytest.mark.vcr
    def test_refextract_no_references(self):
        workflow_data = {"id": self.workflow_id, "data": {}, "form_data": None}

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.refextract",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert "references" not in workflow_result["data"]

    @patch(
        "include.inspire.refextract_utils.match_references_hep",
        return_value=[
            {
                "reference": {"misc": ["is given by (17), i.e., R\u0302PP"]},
                "raw_refs": [
                    {
                        "schema": "text",
                        "value": "is given by (17), i.e., R\u0302PP",
                        "source": "arXiv",
                    }
                ],
            },
            {
                "raw_refs": [
                    {
                        "schema": "text",
                        "value": "\u0000\u0013 \u0000\u001a\u0000\u0018\u0000\u0013",
                        "source": "arXiv",
                    }
                ]
            },
            {
                "reference": {"misc": ["7LPH6WHSt"]},
                "raw_refs": [
                    {
                        "schema": "text",
                        "value": "\u00007\u0000S\u0000\u0003t",
                        "source": "arXiv",
                    }
                ],
            },
        ],
    )
    @pytest.mark.vcr
    def test_refextract_invalid_characters(self, mock_match_references_hep, datadir):
        filename = "1802.08709.pdf"
        self.s3_hook.load_file(
            datadir / filename,
            f"{self.workflow_id}/documents/{filename}",
            self.bucket_name,
            replace=True,
        )
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "documents": [
                    {"key": filename},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.refextract",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert len(workflow_result["data"]["references"]) == 1

    def test_classify_paper_with_fulltext(self, tmpdir, higgs_ontology):
        fulltext_name = "fulltext.txt"
        fulltext = tmpdir.join(fulltext_name)
        fulltext.write("Higgs boson")

        self.s3_hook.load_file(
            fulltext,
            f"{self.context['params']['workflow_id']}/documents/{fulltext_name}",
            self.bucket_name,
            replace=True,
        )

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "documents": [
                    {"key": fulltext_name},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        expected_fulltext_keywords = [{"number": 1, "keyword": "Higgs particle"}]

        task_test(
            "hep_create_dag",
            "preprocessing.classify_paper",
            params={
                "taxonomy": higgs_ontology,
                "only_core_tags": False,
                "spires": True,
                "with_author_keywords": True,
                "no_cache": True,
            },
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        classifier_results = workflow_result["classifier_results"]

        assert (
            classifier_results["complete_output"]["core_keywords"]
            == expected_fulltext_keywords
        )
        assert classifier_results["fulltext_used"] is True
        assert "extracted_keywords" not in classifier_results

    def test_classify_paper_with_no_fulltext(self, higgs_ontology):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "titles": [
                        {
                            "title": "Some title",
                        },
                    ],
                    "abstracts": [
                        {"value": "Very interesting paper about the Higgs boson."},
                    ],
                },
            },
            self.bucket_name,
        )

        expected_kewords = [{"number": 1, "keyword": "Higgs particle"}]

        task_test(
            "hep_create_dag",
            "preprocessing.classify_paper",
            params={
                "taxonomy": higgs_ontology,
                "only_core_tags": False,
                "spires": True,
                "with_author_keywords": True,
                "no_cache": True,
            },
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        classifier_results = workflow_result["classifier_results"]

        assert (
            classifier_results["complete_output"]["core_keywords"] == expected_kewords
        )
        assert classifier_results["fulltext_used"] is False

    def test_classify_paper_uses_keywords(self, higgs_ontology):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "titles": [
                        {
                            "title": "Some title",
                        },
                    ],
                    "keywords": [
                        {
                            "value": "Higgs boson",
                        },
                    ],
                },
            },
            self.bucket_name,
        )

        expected = [{"number": 1, "keyword": "Higgs particle"}]

        task_test(
            "hep_create_dag",
            "preprocessing.classify_paper",
            params={
                "taxonomy": higgs_ontology,
                "only_core_tags": False,
                "spires": True,
                "with_author_keywords": True,
                "no_cache": True,
            },
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        classifier_results = workflow_result["classifier_results"]

        assert classifier_results["complete_output"]["core_keywords"] == expected
        assert classifier_results["fulltext_used"] is False

    def test_classify_paper_does_not_raise_on_unprintable_keywords(
        self, datadir, higgs_ontology
    ):
        paper_with_unprintable_keywords = "1802.08709.pdf"

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "documents": [
                    {"key": paper_with_unprintable_keywords},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        self.s3_hook.load_file(
            datadir / paper_with_unprintable_keywords,
            f"{self.workflow_id}/documents/{paper_with_unprintable_keywords}",
            self.bucket_name,
            replace=True,
        )

        task_test(
            "hep_create_dag",
            "preprocessing.classify_paper",
            params={
                "taxonomy": higgs_ontology,
                "only_core_tags": False,
                "spires": True,
                "with_author_keywords": True,
                "no_cache": True,
            },
            dag_params=self.context["params"],
        )

    def test_classify_paper_with_fulltext_and_data(self, tmpdir, higgs_ontology):
        fulltext_name = "fulltext.txt"
        fulltext = tmpdir.join(fulltext_name)
        fulltext.write("Core Keyword")

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {
                        "title": "Some title",
                    },
                ],
                "abstracts": [
                    {"value": "Very interesting paper about the Higgs boson."},
                ],
                "documents": [
                    {"key": fulltext_name},
                ],
            },
        }

        self.s3_hook.load_file(
            fulltext,
            f"{self.context['params']['workflow_id']}/documents/{fulltext_name}",
            self.bucket_name,
            replace=True,
        )

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        expected_keywords = [{"number": 1, "keyword": "Core Keyword"}]

        task_test(
            "hep_create_dag",
            "preprocessing.classify_paper",
            params={
                "taxonomy": higgs_ontology,
                "only_core_tags": False,
                "spires": True,
                "with_author_keywords": True,
                "no_cache": True,
            },
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        classifier_results = workflow_result["classifier_results"]

        assert (
            classifier_results["complete_output"]["core_keywords"] == expected_keywords
        )

        assert classifier_results["fulltext_used"] is True

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_extract_authors_from_pdf_when_no_authors_in_metadata(self, datadir):
        pdf_file = "1802.08709.pdf"

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "documents": [
                    {"key": pdf_file},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        self.s3_hook.load_file(
            (datadir / pdf_file),
            f"{self.workflow_id}/documents/{pdf_file}",
            self.bucket_name,
            replace=True,
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.extract_authors_from_pdf",
            dag_params={"workflow_id": self.workflow_id},
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert len(workflow_result["data"]["authors"]) == 169

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_extract_authors_from_pdf_number_of_authors_is_same_after_merge_with_grobid(
        self, datadir
    ):
        pdf_file = "1802.08709.pdf"

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "authors": [{"full_name": "author 1"}],
                "documents": [
                    {"key": pdf_file},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        self.s3_hook.load_file(
            (datadir / pdf_file),
            f"{self.workflow_id}/documents/{pdf_file}",
            self.bucket_name,
            replace=True,
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.extract_authors_from_pdf",
            dag_params={"workflow_id": self.workflow_id},
        )
        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert len(workflow_result["data"]["authors"]) == 1

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_extract_authors_from_pdf_no_authors_in_metadata_and_no_authors_from_grobid(
        self, datadir
    ):
        pdf_file = "no_authors.pdf"

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "documents": [
                    {"key": pdf_file},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        self.s3_hook.load_file(
            (datadir / pdf_file),
            f"{self.workflow_id}/documents/{pdf_file}",
            self.bucket_name,
            replace=True,
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.extract_authors_from_pdf",
            dag_params={"workflow_id": self.workflow_id},
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert "authors" not in workflow_result["data"]

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_extract_authors_from_pdf_merges_grobid_affiliations(self, datadir):
        pdf_file = "1612.06414v1.pdf"

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "authors": [
                    {
                        "raw_affiliations": [{"value": "I.N.F.N"}],
                        "full_name": "Moskovic, Micha",
                    },
                    {
                        "raw_affiliations": [{"value": "ICTP"}],
                        "full_name": "Assi, Ahmed Zein",
                        "emails": ["zeinassi@cern.ch"],
                    },
                ],
                "documents": [
                    {"key": pdf_file},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        self.s3_hook.load_file(
            (datadir / pdf_file),
            f"{self.workflow_id}/documents/{pdf_file}",
            self.bucket_name,
            replace=True,
        )

        expected_authors = [
            {
                "emails": ["moskovic@to.infn.it"],
                "full_name": "Moskovic, Micha",
                "raw_affiliations": [
                    {
                        "value": "Università di Torino, Dipartimento di Fisica and "
                        "I.N.F.N. -sezione di Torino, Via P. Giuria 1,"
                        " I-10125 Torino, Italy"
                    }
                ],
            },
            {
                "emails": ["zeinassi@cern.ch"],
                "full_name": "Assi, Ahmed Zein",
                "raw_affiliations": [
                    {
                        "value": "High Energy Section -ICTP, Strada Costiera,"
                        " 11-34014 Trieste, Italy"
                    }
                ],
            },
        ]

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.extract_authors_from_pdf",
            dag_params={"workflow_id": self.workflow_id},
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert workflow_result["data"]["authors"] == expected_authors

    def test_guess_coreness(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {"title": "Study of Higgs boson production in particle physics"}
                ],
                "abstracts": [
                    {
                        "value": (
                            "We present a comprehensive study of Higgs boson"
                            " production mechanisms in high-energy particle collisions."
                        )
                    }
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "preprocessing.guess_coreness",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        relevance_prediction = workflow_result["relevance_prediction"]

        assert "scores" in relevance_prediction
        assert "decision" in relevance_prediction
        assert relevance_prediction["decision"] in ["CORE", "Non-CORE", "Rejected"]
        assert "max_score" in relevance_prediction
        assert "relevance_score" in relevance_prediction

    @patch(
        "inspire_classifier.Classifier.predict_coreness",
        side_effect=Exception("Classifier failure"),
    )
    def test_guess_coreness_fail(self, mock_predict_coreness):
        workflow_data = {"id": self.workflow_id, "data": {}}
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        with pytest.raises(Exception, match="Classifier failure"):
            task_test(
                "hep_create_dag",
                "preprocessing.guess_coreness",
                dag_params=self.context["params"],
            )

    @pytest.mark.vcr
    def test_notify_if_submission(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test literature_submission ticket"}],
                "acquisition_source": {
                    "method": "submitter",
                    "source": "submitter",
                    "email": "",
                },
                "_collections": ["Literature"],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_if_submission",
            dag_params=self.context["params"],
        )

        workflow = get_lit_workflow_task(self.workflow_id)

        assert get_ticket_by_type(workflow, TICKET_HEP_SUBMISSION)

    @pytest.mark.vcr
    def test_notify_if_submission_not_submission(self):
        workflow_id = "26f5c03b-6085-4d1c-a300-bfac9df4b1b3"
        workflow_data = {
            "id": workflow_id,
            "data": {
                "titles": [{"title": "test arxiv doenst open ticket"}],
                "acquisition_source": {"method": "arxiv", "source": "arxiv"},
                "_collections": ["Literature"],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_if_submission",
            dag_params=self.context["params"],
        )

        workflow = get_lit_workflow_task(workflow_id)

        assert not get_ticket_by_type(workflow, TICKET_HEP_SUBMISSION)

    @pytest.mark.vcr
    def test_notify_if_submission_ticket_already_exists(self):
        workflow_id = "7b617859-cb4f-4526-aa85-ec5291dc141b"
        workflow_data = {
            "id": workflow_id,
            "data": {
                "titles": [{"title": "test ticket already exists"}],
                "acquisition_source": {"method": "submitter", "source": "submitter"},
                "_collections": ["Literature"],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_if_submission",
            dag_params={"workflow_id": workflow_id},
        )

        workflow = get_lit_workflow_task(workflow_id)

        assert get_ticket_by_type(workflow, TICKET_HEP_SUBMISSION)

    def test_get_approved_match_none(self):
        assert not task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.get_approved_match",
            dag_params=self.context["params"],
        )

    @patch("airflow.models.taskinstance.TaskInstance.xcom_pull")
    def test_get_approved_match_exists(self, mock_xcom_pull):
        mock_xcom_pull.return_value = "paper17"

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.get_approved_match",
            dag_params=self.context["params"],
        )

        assert result == "paper17"

    @pytest.mark.vcr
    def test_check_is_update_merge(self):
        s3.write_workflow(
            self.s3_hook,
            {"id": self.workflow_id, "workflow_type": HEP_CREATE},
            self.bucket_name,
        )
        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.check_is_update",
            params={"match_approved_id": 7},
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )
        assert (
            "halt_for_approval_if_new_or_reject_if_not_relevant.merge_articles"
            in result["followed"]
        )
        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        assert workflow_result["workflow_type"] == HEP_UPDATE

        workflow_backoffice = get_lit_workflow_task(self.workflow_id)
        assert workflow_backoffice["workflow_type"] == HEP_UPDATE

    def test_check_is_update_none(self):
        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.check_is_update",
            params={"match_approved_id": None},
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )
        assert (
            "halt_for_approval_if_new_or_reject_if_not_relevant.update_inspire_categories"
            in result["followed"]
        )

    def test_is_core_true(self):
        s3.write_workflow(
            self.s3_hook,
            {"id": self.workflow_id, "data": {"core": True}},
            self.bucket_name,
        )
        result = task_test(
            "hep_create_dag",
            "core_selection.is_core",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )
        assert "core_selection.normalize_author_affiliations" in result["followed"]

    def test_is_core_false(self):
        s3.write_workflow(
            self.s3_hook,
            {"id": self.workflow_id, "data": {"core": False}},
            self.bucket_name,
        )
        result = task_test(
            "hep_create_dag",
            "core_selection.is_core",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )
        assert (
            "core_selection.remove_inspire_categories_derived_from_core_arxiv_categories"
            in result["followed"]
        )

    @pytest.mark.vcr
    def test_merge_articles(self):
        s3.write_workflow(
            self.s3_hook,
            {
                "id": self.workflow_id,
                "data": {
                    "titles": [
                        {"title": "New title"},
                    ],
                    "authors": [{"full_name": "Blumaaaaaaa, T."}],
                    "arxiv_eprints": [{"value": "1801.07224"}],
                    "document_type": [
                        "article",
                    ],
                    "_collections": ["Literature"],
                },
                "workflow_type": HEP_CREATE,
            },
            self.bucket_name,
        )
        task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.merge_articles",
            params={"matched_control_number": 1649231},
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert len(workflow_result["data"]["titles"]) == 2
        assert {"title": "New title"} in workflow_result["data"]["titles"]
        assert "merge_details" in workflow_result
        assert "conflicts" in workflow_result["merge_details"]

        backoffice_workflow = get_lit_workflow_task(self.workflow_id)

        assert workflow_result["data"] == backoffice_workflow["data"]
        assert workflow_result["merge_details"] == backoffice_workflow["merge_details"]

    @pytest.mark.vcr
    def test_await_merge_conflicts_resolved_no_conflicts(self):
        workflow_id = "7b617859-cb4f-4526-aa85-ec5291dc141b"

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.await_merge_conflicts_resolved",
            dag_params={"workflow_id": workflow_id},
        )
        workflow_result = s3.read_workflow(self.s3_hook, self.bucket_name, workflow_id)

        assert result
        assert get_flag("approved", workflow_result)

    @pytest.mark.vcr
    def test_await_merge_conflicts_resolved_w_conflicts_no_decision(self):
        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.await_merge_conflicts_resolved",
            dag_params={"workflow_id": "7c6b56bd-6166-4fee-ad6f-5b99b7d37b7e"},
        )

        assert not result

    @pytest.mark.vcr
    def test_await_merge_conflicts_resolved_w_conflicts_and_decision(self):
        workflow_id = "f9fc9d83-fd28-450e-bfde-d1ed07dc87f5"

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.await_merge_conflicts_resolved",
            dag_params={"workflow_id": workflow_id},
        )
        workflow_result = s3.read_workflow(self.s3_hook, self.bucket_name, workflow_id)

        assert result
        assert get_flag("approved", workflow_result)

    def test_update_inspire_categories(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {},
            "journal_inspire_categories": [
                {"term": "Astrophysics"},
                {"term": "Accelerators"},
            ],
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.update_inspire_categories",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert (
            workflow_result["data"]["inspire_categories"]
            == workflow_data["journal_inspire_categories"]
        )

    def test_dont_update_inspire_categories(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "inspire_categories": [
                    {"term": "Test"},
                ]
            },
            "journal_inspire_categories": [
                {"term": "Astrophysics"},
                {"term": "Accelerators"},
            ],
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.update_inspire_categories",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert (
            workflow_result["data"]["inspire_categories"]
            != workflow_result["journal_inspire_categories"]
        )

    def test_is_record_accepted_true(self):
        s3.write_workflow(
            self.s3_hook,
            {"id": self.workflow_id, "flags": {"approved": True}},
            self.bucket_name,
        )
        result = task_test(
            "hep_create_dag",
            "is_record_accepted",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )
        assert "postprocessing.set_core_if_not_update" in result["followed"]

    def test_is_record_accepted_false(self):
        s3.write_workflow(
            self.s3_hook,
            {"id": self.workflow_id, "flags": {"approved": False}},
            self.bucket_name,
        )
        result = task_test(
            "hep_create_dag",
            "is_record_accepted",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "notify_and_close_not_accepted" in result["followed"]

    @pytest.mark.vcr
    def test_notify_and_close_not_accepted(self):
        workflow_id = "7c6b56bd-6166-4fee-ad6f-5b99b7d37b7e"

        workflow_data = get_lit_workflow_task(workflow_id)
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_if_submission",
            dag_params={"workflow_id": workflow_id},
        )

        s3.write_workflow(
            self.s3_hook,
            get_lit_workflow_task(workflow_id),
            self.bucket_name,
        )

        task_test(
            "hep_create_dag",
            "notify_and_close_not_accepted",
            dag_params={"workflow_id": workflow_id},
        )

    def test_set_core_if_not_update_and_auto_approve(self):
        workflow_data = {
            "flags": {"is-update": False},
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["article"],
            },
            "core": True,
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.set_core_if_not_update",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert workflow_result["data"]["core"]

    def test_set_core_if_not_update_and_hep_accept_core(self):
        workflow_data = {
            "flags": {"is-update": False},
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["article"],
            },
            "decisions": [
                {
                    "id": 5,
                    "workflow": "6ce1d776-4ec8-4c3a-a6e0-c5ba9006dd2f",
                    "_created_at": "2025-08-26T14:45:14.237000Z",
                    "_updated_at": "2025-08-26T14:45:14.237000Z",
                    "action": DECISION_HEP_ACCEPT_CORE,
                    "value": "",
                    "user": "admin@admin.com",
                }
            ],
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.set_core_if_not_update",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert workflow_result["data"]["core"]

    def test_set_core_skips_if_update_flag_is_true(self):
        workflow_data = {
            "flags": {"is-update": True},
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["article"],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        assert not task_test(
            "hep_create_dag",
            "postprocessing.set_core_if_not_update",
            dag_params=self.context["params"],
        )

    def test_set_core_if_not_update_and_hep_accept(self):
        workflow_data = {
            "flags": {"is-update": False},
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["article"],
            },
            "decisions": [
                {
                    "id": 5,
                    "workflow": "6ce1d776-4ec8-4c3a-a6e0-c5ba9006dd2f",
                    "_created_at": "2025-08-26T14:45:14.237000Z",
                    "_updated_at": "2025-08-26T14:45:14.237000Z",
                    "action": "hep_accept",
                    "value": "",
                    "user": "admin@admin.com",
                }
            ],
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.set_core_if_not_update",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert not workflow_result["data"]["core"]

    @pytest.mark.vcr
    def test_set_refereed_and_fix_document_type_sets_refereed_to_true(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["article"],
                "publication_info": [
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1213100"
                        }
                    },
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1214516"
                        }
                    },
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.set_refereed_and_fix_document_type",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert workflow_result["data"]["refereed"] is True
        assert workflow_result["data"]["document_type"] == ["article"]

    @pytest.mark.vcr
    def test_set_refereed_and_fix_document_type_sets_refereed_updates_document_type(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["article"],
                "publication_info": [
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1213101"
                        }
                    },
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1213102"
                        }
                    },
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.set_refereed_and_fix_document_type",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert not workflow_result["data"]["refereed"]
        assert workflow_result["data"]["document_type"] == ["conference paper"]

    @pytest.mark.vcr
    def test_set_refereed_and_fix_document_type_sets_refereed_persists_document_type(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["article"],
                "publication_info": [
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1213104"
                        }
                    },
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1213105"
                        }
                    },
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.set_refereed_and_fix_document_type",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert not workflow_result["data"]["refereed"]
        assert workflow_result["data"]["document_type"] == ["article"]

    @pytest.mark.vcr
    def test_normalize_affiliations_happy_flow(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["report"],
                "authors": [
                    {
                        "full_name": "Kowal, Michal",
                        "raw_affiliations": [
                            {
                                "value": "Faculty of Physics, University of Warsaw,"
                                " Pasteura Warsaw"
                            }
                        ],
                    },
                    {
                        "full_name": "Latacz, Barbara",
                        "raw_affiliations": [{"value": "CERN, Genève, Switzerland"}],
                    },
                ],
                "core": True,
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.normalize_author_affiliations",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert workflow_result["data"]["authors"][0]["affiliations"] == [
            {
                "record": {"$ref": "https://inspirebeta.net/api/institutions/903335"},
                "value": "Warsaw U.",
            }
        ]
        assert workflow_result["data"]["authors"][1]["affiliations"] == [
            {
                "record": {"$ref": "https://inspirebeta.net/api/institutions/902725"},
                "value": "CERN",
            }
        ]

    @pytest.mark.vcr
    def test_normalize_affiliations_when_authors_has_two_happy_flow(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["report"],
                "authors": [
                    {
                        "full_name": "Kowal, Michal",
                        "raw_affiliations": [
                            {
                                "value": "Faculty of Physics, University of Warsaw,"
                                " Pasteura Warsaw"
                            },
                            {"value": "CERN, Genève, Switzerland"},
                        ],
                    }
                ],
                "core": True,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.normalize_author_affiliations",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert workflow_result["data"]["authors"][0]["affiliations"] == [
            {
                "record": {"$ref": "https://inspirebeta.net/api/institutions/903335"},
                "value": "Warsaw U.",
            },
            {
                "record": {"$ref": "https://inspirebeta.net/api/institutions/902725"},
                "value": "CERN",
            },
        ]

    @pytest.mark.vcr
    def test_normalize_affiliations_handle_not_found_affiliations(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["report"],
                "authors": [
                    {
                        "full_name": "Kowal, Michal",
                        "raw_affiliations": [{"value": "Non existing aff"}],
                    },
                ],
            },
            "core": True,
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.normalize_author_affiliations",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert not workflow_result["data"]["authors"][0].get("affiliations")

    @pytest.mark.vcr
    def test_normalize_affiliations_when_lit_affiliation_missing_institution_ref(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": ["A title"],
                "document_type": ["report"],
                "authors": [
                    {
                        "full_name": "Kozioł, Karol",
                        "raw_affiliations": [
                            {"value": "NCBJ Świerk"},
                            {"value": "CERN, Genève, Switzerland"},
                        ],
                    }
                ],
                "core": True,
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.normalize_author_affiliations",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert workflow_result["data"]["authors"][0]["affiliations"] == [
            {
                "value": "NCBJ, Swierk",
            },
            {
                "record": {"$ref": "https://inspirebeta.net/api/institutions/902725"},
                "value": "CERN",
            },
        ]

    @pytest.mark.vcr
    def test_save_and_complete_workflow(self):
        workflow_data = {
            "id": self.workflow_id,
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
            "status": STATUS_RUNNING,
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "save_and_complete_workflow",
            dag_params=self.context["params"],
        )

        workflow = get_lit_workflow_task(self.workflow_id)
        assert workflow["status"] == STATUS_COMPLETED
        assert workflow_data["data"] == workflow["data"]

    @pytest.mark.vcr
    def test_link_institutions_with_affiliations(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test affiliation"}],
                "authors": [
                    {
                        "full_name": "Test, Aff.",
                        "affiliations": [{"value": "Warsaw U."}],
                    }
                ],
                "document_type": [
                    "article",
                ],
                "_collections": ["Literature"],
            },
            "workflow_type": HEP_CREATE,
            "status": STATUS_RUNNING,
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.link_institutions_with_affiliations",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert (
            "$ref" in workflow_result["data"]["authors"][0]["affiliations"][0]["record"]
        )

    def test_link_institutions_with_affiliations_no_authors(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test affiliation"}],
                "document_type": [
                    "article",
                ],
                "_collections": ["Literature"],
            },
            "workflow_type": HEP_CREATE,
            "status": STATUS_RUNNING,
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "postprocessing.link_institutions_with_affiliations",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert "authors" not in workflow_result["data"]

    def test_is_record_relevant_submission(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test submission"}],
                "acquisition_source": {
                    "method": "submitter",
                },
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant",
            dag_params=self.context["params"],
        )

        assert (
            result == "halt_for_approval_if_new_or_reject_if_not_relevant."
            "await_decision_approval"
        )

    def test_is_record_relevant_full_journal_coverage(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test full coverage"}],
                "acquisition_source": {
                    "method": "hepcrawl",
                },
            },
            "journal_coverage": "full",
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant",
            dag_params=self.context["params"],
        )

        assert (
            result == "halt_for_approval_if_new_or_reject_if_not_relevant."
            "await_decision_approval"
        )

    def test_is_record_relevant_auto_approved(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test auto approved"}],
                "acquisition_source": {
                    "method": "hepcrawl",
                },
            },
            "journal_coverage": "partial",
            "flags": {
                "auto-approved": True,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant",
            dag_params=self.context["params"],
        )

        assert (
            result == "halt_for_approval_if_new_or_reject_if_not_relevant."
            "await_decision_approval"
        )

    def test_is_record_relevant_auto_rejected(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test auto rejected"}],
                "acquisition_source": {
                    "method": "hepcrawl",
                },
            },
            "journal_coverage": "partial",
            "flags": {
                "auto-approved": False,
            },
            "relevance_prediction": {
                "decision": "Rejected",
            },
            "classifier_results": {
                "fulltext_used": True,
                "complete_output": {
                    "core_keywords": [],
                },
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert (
            "halt_for_approval_if_new_or_reject_if_not_relevant.should_replace_collection_to_hidden"
            in result["followed"]
        )

    def test_is_record_relevant_rejected_with_core_keywords(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test rejected with keywords"}],
                "acquisition_source": {
                    "method": "hepcrawl",
                },
            },
            "journal_coverage": "partial",
            "flags": {"auto-approved": False},
            "relevance_prediction": {
                "decision": "Rejected",
            },
            "classifier_results": {
                "fulltext_used": True,
                "complete_output": {
                    "core_keywords": [{"keyword": "Higgs particle"}],
                },
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant",
            dag_params=self.context["params"],
        )

        assert (
            result == "halt_for_approval_if_new_or_reject_if_not_relevant."
            "await_decision_approval"
        )

    def test_is_record_relevant_missing_classification_results(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test missing classification"}],
                "acquisition_source": {
                    "method": "hepcrawl",
                },
            },
            "journal_coverage": "partial",
            "flags": {"auto-approved": False},
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant",
            dag_params=self.context["params"],
        )

        assert (
            result == "halt_for_approval_if_new_or_reject_if_not_relevant."
            "await_decision_approval"
        )

    def test_is_record_relevant_non_rejected_decision(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
                "acquisition_source": {
                    "method": "hepcrawl",
                },
            },
            "journal_coverage": "partial",
            "flags": {"auto-approved": False},
            "relevance_prediction": {
                "decision": "CORE",
            },
            "classifier_results": {
                "fulltext_used": True,
                "complete_output": {
                    "core_keywords": [],
                },
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant",
            dag_params=self.context["params"],
        )

        assert (
            result == "halt_for_approval_if_new_or_reject_if_not_relevant."
            "await_decision_approval"
        )

    @pytest.mark.vcr
    def test_await_decision_approval_no_decision(self):
        set_lit_workflow_task(status_name=STATUS_RUNNING, workflow_id=self.workflow_id)
        assert not task_test(
            dag_id="hep_create_dag",
            task_id="halt_for_approval_if_new_or_reject_if_not_relevant.await_decision_approval",
            dag_params=self.context["params"],
        )

        workflow = get_lit_workflow_task(self.workflow_id)
        assert workflow["status"] == STATUS_APPROVAL

    @pytest.mark.vcr
    def test_await_decision_approval_accept(self):
        workflow_id = "66961888-a628-46b7-b807-4deae3478adc"
        assert task_test(
            dag_id="hep_create_dag",
            task_id="halt_for_approval_if_new_or_reject_if_not_relevant.await_decision_approval",
            dag_params={"workflow_id": workflow_id},
        )

        workflow_result = s3.read_workflow(self.s3_hook, self.bucket_name, workflow_id)

        assert workflow_result["flags"]["approved"] is True
        assert get_lit_workflow_task(workflow_id)["status"] == STATUS_RUNNING

    @pytest.mark.vcr
    def test_await_decision_approval_core(self):
        workflow_id = "6e84fd0b-8d0b-4147-9aee-c28a4f787b0d"
        assert task_test(
            dag_id="hep_create_dag",
            task_id="halt_for_approval_if_new_or_reject_if_not_relevant.await_decision_approval",
            dag_params={"workflow_id": workflow_id},
        )

        workflow_result = s3.read_workflow(self.s3_hook, self.bucket_name, workflow_id)

        assert workflow_result["flags"]["approved"] is True
        assert get_lit_workflow_task(workflow_id)["status"] == STATUS_RUNNING

    @pytest.mark.vcr
    def test_await_decision_approval_reject(self):
        workflow_id = "07c5a66c-1e5b-4da6-823c-871caf43e073"
        assert task_test(
            dag_id="hep_create_dag",
            task_id="halt_for_approval_if_new_or_reject_if_not_relevant.await_decision_approval",
            dag_params={"workflow_id": workflow_id},
        )

        workflow_result = s3.read_workflow(self.s3_hook, self.bucket_name, workflow_id)

        assert workflow_result["flags"]["approved"] is False
        assert get_lit_workflow_task(workflow_id)["status"] == STATUS_RUNNING

    def test_replace_collection_to_hidden_sets_proper_hidden_collections_on_metadata(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
                "authors": [
                    {
                        "raw_affiliations": [
                            {
                                "value": "Some longer description CErN? "
                                "with proper keyword included"
                            },
                            {
                                "value": "Another one but this time with "
                                "wrong keywords IN2P345 included"
                            },
                        ],
                        "full_name": "Author, One",
                    },
                    {
                        "raw_affiliations": [
                            {"value": "Blah blah blah fermilab, blah blah"}
                        ],
                        "full_name": "Author, Two",
                    },
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        expected_collections = ["CDS Hidden", "Fermilab"]
        task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.replace_collection_to_hidden",
            dag_params=self.context["params"],
        )

        workflow_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        collections = sorted(workflow_data["data"]["_collections"])
        assert collections == expected_collections

    def test_replace_collection_to_hidden_sets_from_report_number(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
                "report_numbers": [{"value": "CERN-2019"}, {"value": "FERMILAB-1923"}],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        expected_collections = ["CDS Hidden", "Fermilab"]

        task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.replace_collection_to_hidden",
            dag_params=self.context["params"],
        )

        workflow_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        collections = sorted(workflow_data["data"]["_collections"])
        assert collections == expected_collections

    def test_replace_collection_to_hidden_sets_from_report_number_and_affiliations(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
                "authors": [
                    {
                        "raw_affiliations": [
                            {
                                "value": "Another one but this time with "
                                "wrong keywords Fermilab"
                            }
                        ],
                    },
                    {"value": "Blah blah blah fermilab, blah blah"},
                ],
                "report_numbers": [{"value": "CERN-2019"}],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        expected_collections = ["CDS Hidden", "Fermilab"]

        task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.replace_collection_to_hidden",
            dag_params=self.context["params"],
        )

        workflow_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        collections = sorted(workflow_data["data"]["_collections"])
        assert collections == expected_collections

    def test_affiliations_for_hidden_collections_for_complex_affiliations_value(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
                "authors": [
                    {
                        "raw_affiliations": [
                            {
                                "value": "Some longer description In2P3. "
                                "with proper keyword included"
                            },
                            {
                                "value": "Another one but this time with wrong  "
                                "keywords Fremilab included"
                            },
                        ],
                    }
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.replace_collection_to_hidden",
            dag_params=self.context["params"],
        )

        expected_collections = ["HAL Hidden"]

        workflow_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        collections = workflow_data["data"]["_collections"]
        assert collections == expected_collections

    def test_should_replace_collection_true(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
                "authors": [
                    {
                        "raw_affiliations": [
                            {
                                "value": "Another one but this time with "
                                "wrong keywords Fermilab"
                            }
                        ],
                    },
                    {"value": "Blah blah blah fermilab, blah blah"},
                ],
                "report_numbers": [{"value": "CERN-2019"}],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.should_replace_collection_to_hidden",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )
        assert (
            "halt_for_approval_if_new_or_reject_if_not_relevant.replace_collection_to_hidden"
            in result["followed"]
        )

    @pytest.mark.vcr
    def test_should_replace_collection_false(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.should_replace_collection_to_hidden",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert (
            "halt_for_approval_if_new_or_reject_if_not_relevant.halt_end"
            in result["followed"]
        )

        workflow = get_lit_workflow_task(self.workflow_id)
        assert workflows.get_decision(workflow.get("decisions"), DECISION_AUTO_REJECT)

    @pytest.mark.vcr
    def test_should_replace_collection_false_does_not_replace_decision(
        self,
    ):
        workflow_id = "12d8d847-d16e-4f93-a386-df50a7aceadd"
        workflow_data = {
            "id": workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
            },
            "decisions": [
                {
                    "user": "admin@admin.com",
                    "_created_at": "2025-08-26T14:45:14.237Z",
                    "_updated_at": "2025-08-26T14:45:14.237Z",
                    "workflow": workflow_id,
                    "action": DECISION_HEP_REJECT,
                }
            ],
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "halt_for_approval_if_new_or_reject_if_not_relevant.should_replace_collection_to_hidden",
            dag_params={"workflow_id": workflow_id},
            xcom_key="skipmixin_key",
        )

        assert (
            "halt_for_approval_if_new_or_reject_if_not_relevant.halt_end"
            in result["followed"]
        )

        workflow = get_lit_workflow_task(workflow_id)
        assert workflows.get_decision(workflow.get("decisions"), DECISION_HEP_REJECT)

    @pytest.mark.vcr
    def test_notify_and_close_accepted(self):
        workflow_id = "f9fc9d83-fd28-450e-bfde-d1ed07dc87f5"

        workflow_data = get_lit_workflow_task(workflow_id)
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_if_submission",
            dag_params={"workflow_id": workflow_id},
        )

        s3.write_workflow(
            self.s3_hook, get_lit_workflow_task(workflow_id), self.bucket_name
        )

        task_test(
            "hep_create_dag",
            "notify_and_close_accepted",
            dag_params={"workflow_id": workflow_id},
        )

    @patch("hooks.inspirehep.inspire_http_hook.InspireHttpHook.create_ticket")
    def test_notify_curator_if_needed_no_curation(self, mock_create_ticket):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test non rejected"}],
            },
            "flags": {
                "is-update": True,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_curator_if_needed",
            dag_params=self.context["params"],
        )
        assert mock_create_ticket.call_count == 0

    @patch("include.utils.workflows.get_fulltext", return_value="france")
    @patch("hooks.inspirehep.inspire_http_hook.InspireHttpHook.create_ticket")
    @patch(
        "hooks.backoffice.workflow_ticket_management_hook.LiteratureWorkflowTicketManagementHook.create_ticket_entry"
    )
    def test_notify_curator_if_needed_needed_france_fulltext(
        self, mock_create_ticket_entry, mock_create_ticket, mock_get_fulltext
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "acquisition_source": {
                    "method": "hepcrawl",
                    "source": "arXiv",
                },
                "arxiv_eprints": [],
            },
            "flags": {
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_curator_if_needed",
            dag_params=self.context["params"],
        )
        mock_create_ticket.assert_called_once()
        mock_create_ticket_entry.assert_called_once()

    @patch("include.utils.workflows.get_fulltext", return_value="germany")
    @patch("hooks.inspirehep.inspire_http_hook.InspireHttpHook.create_ticket")
    @patch(
        "hooks.backoffice.workflow_ticket_management_hook.LiteratureWorkflowTicketManagementHook.create_ticket_entry"
    )
    def test_notify_curator_if_needed_germany_fulltext(
        self, mock_create_ticket_entry, mock_create_ticket, mock_get_fulltext
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "core": True,
                "acquisition_source": {
                    "method": "hepcrawl",
                    "source": "arXiv",
                },
                "arxiv_eprints": [],
            },
            "flags": {
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_curator_if_needed",
            dag_params=self.context["params"],
        )

        assert mock_create_ticket.call_count == 2
        assert mock_create_ticket_entry.call_count == 2

    @patch("hooks.inspirehep.inspire_http_hook.InspireHttpHook.create_ticket")
    @patch(
        "hooks.backoffice.workflow_ticket_management_hook.LiteratureWorkflowTicketManagementHook.create_ticket_entry"
    )
    def test_notify_curator_if_needed_raw_affiliations_france(
        self, mock_create_ticket_entry, mock_create_ticket
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "acquisition_source": {
                    "method": "submitter",
                    "source": "submitter",
                },
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [{"value": "France"}],
                    }
                ],
            },
            "flags": {
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_curator_if_needed",
            dag_params=self.context["params"],
        )
        mock_create_ticket.assert_called_once()
        mock_create_ticket_entry.assert_called_once()

    @patch("hooks.inspirehep.inspire_http_hook.InspireHttpHook.create_ticket")
    @patch(
        "hooks.backoffice.workflow_ticket_management_hook.LiteratureWorkflowTicketManagementHook.create_ticket_entry"
    )
    def test_notify_curator_if_needed_raw_affiliations_uk(
        self, mock_create_ticket_entry, mock_create_ticket
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "acquisition_source": {
                    "method": "submitter",
                    "source": "submitter",
                },
                "core": True,
                "authors": [
                    {
                        "full_name": "author 1",
                        "raw_affiliations": [{"value": "uk"}],
                    }
                ],
            },
            "flags": {
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_curator_if_needed",
            dag_params=self.context["params"],
        )
        assert mock_create_ticket.call_count == 2
        assert mock_create_ticket_entry.call_count == 2

    @pytest.mark.vcr
    @patch("hooks.inspirehep.inspire_http_hook.InspireHttpHook.create_ticket")
    @patch(
        "hooks.backoffice.workflow_ticket_management_hook.LiteratureWorkflowTicketManagementHook.create_ticket_entry"
    )
    def test_notify_curator_if_needed_submitter_or_arxiv(
        self, mock_create_ticket_entry, mock_create_ticket
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "core": True,
                "acquisition_source": {
                    "method": "submitter",
                    "source": "submitter",
                },
            },
            "flags": {
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "notify_curator_if_needed",
            dag_params=self.context["params"],
        )
        mock_create_ticket.assert_called_once()
        mock_create_ticket_entry.assert_called_once()

    def test_should_proceed_to_core_selection_true(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {"title": "test non rejected"},
                ],
                "core": False,
            },
            "flags": {
                "auto-approved": True,
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "should_proceed_to_core_selection",
            dag_params=self.context["params"],
        )

        assert result == "save_workflow"

    def test_should_proceed_to_core_selection_true_not_set(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {"title": "test core not set"},
                ],
            },
            "flags": {
                "auto-approved": True,
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "should_proceed_to_core_selection",
            dag_params=self.context["params"],
        )

        assert result == "save_workflow"

    def test_should_proceed_to_core_selection_false_if_core(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {"title": "test non rejected"},
                ],
                "core": True,
            },
            "flags": {
                "auto-approved": True,
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "should_proceed_to_core_selection",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "save_and_complete_workflow" in result["followed"]

    def test_should_proceed_to_core_selection_false_if_update(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {"title": "test non rejected"},
                ],
                "core": False,
            },
            "flags": {
                "auto-approved": True,
                "is-update": True,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "should_proceed_to_core_selection",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "save_and_complete_workflow" in result["followed"]

    def test_should_proceed_to_core_selection_false_if_not_auto_approved(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [
                    {"title": "test non rejected"},
                ],
                "core": False,
            },
            "flags": {
                "auto-approved": False,
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            "hep_create_dag",
            "should_proceed_to_core_selection",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "save_and_complete_workflow" in result["followed"]

    @pytest.mark.vcr
    def test_await_decision_core_selection_approval_no_decision(self):
        set_lit_workflow_task(status_name=STATUS_RUNNING, workflow_id=self.workflow_id)

        assert not task_test(
            dag_id="hep_create_dag",
            task_id="core_selection.await_decision_core_selection_approval",
            dag_params=self.context["params"],
        )

        workflow = get_lit_workflow_task(self.workflow_id)
        assert workflow["status"] == STATUS_APPROVAL_CORE_SELECTION

    @pytest.mark.vcr
    def test_await_decision_core_selection_approval_decision(self):
        workflow_id = "07c5a66c-1e5b-4da6-823c-871caf43e073"
        assert task_test(
            dag_id="hep_create_dag",
            task_id="core_selection.await_decision_core_selection_approval",
            dag_params={"workflow_id": workflow_id},
        )

        workflow_result = s3.read_workflow(self.s3_hook, self.bucket_name, workflow_id)

        assert len(workflow_result["decisions"]) > 1
        assert get_lit_workflow_task(workflow_id)["status"] == STATUS_RUNNING

        workflow_id = "66961888-a628-46b7-b807-4deae3478adc"
        assert task_test(
            dag_id="hep_create_dag",
            task_id="core_selection.await_decision_core_selection_approval",
            dag_params={"workflow_id": workflow_id},
        )

        workflow_result = s3.read_workflow(self.s3_hook, self.bucket_name, workflow_id)
        assert len(workflow_result["decisions"]) > 1
        assert get_lit_workflow_task(workflow_id)["status"] == STATUS_RUNNING

    def test_remove_inspire_categories_derived_from_core_arxiv_categories(
        self,
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "_collections": ["Literature"],
                "titles": [{"title": "A title"}],
                "document_type": ["report"],
                "arxiv_eprints": [
                    {
                        "categories": [
                            "hep-ph",
                            "astro-ph.CO",
                            "gr-qc",
                            "hep-ex",
                            "hep-th",
                        ],
                        "value": "2207.01633",
                    }
                ],
                "inspire_categories": [
                    {"source": "arxiv", "term": "Phenomenology-HEP"},
                    {"source": "arxiv", "term": "Astrophysics"},
                    {"source": "arxiv", "term": "Gravitation and Cosmology"},
                    {"source": "arxiv", "term": "Experiment-HEP"},
                    {"source": "arxiv", "term": "Theory-HEP"},
                    {"source": "user", "term": "Other"},
                    {"term": "Other"},
                ],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "core_selection.remove_inspire_categories_derived_from_core_arxiv_categories",
            dag_params=self.context["params"],
        )

        schema = load_schema("hep")
        subschema = schema["properties"]["inspire_categories"]

        workflow_data = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )
        expected_inspire_categories = [
            {"source": "arxiv", "term": "Astrophysics"},
            {"source": "arxiv", "term": "Gravitation and Cosmology"},
            {"source": "user", "term": "Other"},
            {"term": "Other"},
        ]
        workflow_inspire_categories = workflow_data["data"]["inspire_categories"]
        assert ordered(workflow_inspire_categories) == ordered(
            expected_inspire_categories
        )
        assert validate(workflow_inspire_categories, subschema) is None

    @pytest.mark.vcr
    def test_is_fresh_data_true(self):
        control_number = 44707

        record = get_inspire_http_record(LITERATURE_PID_TYPE, control_number)
        head_version_id = record["revision_id"]

        workflow_data = {
            "id": self.workflow_id,
            "flags": {
                "is-update": True,
            },
            "merge_details": {
                "head_version_id": head_version_id + 1,
            },
            "data": {"control_number": control_number},
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        assert (
            task_test(
                "hep_create_dag",
                "is_fresh_data",
                dag_params=self.context["params"],
            )
            is None
        )

    @pytest.mark.vcr
    def test_is_fresh_data_false(self):
        control_number = 44707

        record = get_inspire_http_record(LITERATURE_PID_TYPE, control_number)
        head_version_id = record["revision_id"]

        workflow_data = {
            "id": self.workflow_id,
            "flags": {
                "is-update": True,
            },
            "merge_details": {
                "head_version_id": head_version_id,
            },
            "data": {"control_number": control_number},
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        with pytest.raises(AirflowFailException, match="Working with stale data"):
            task_test(
                "hep_create_dag",
                "is_fresh_data",
                dag_params=self.context["params"],
            )

    @pytest.mark.vcr
    def test_is_fresh_data_returns_true_if_is_update_is_falsy(self):
        workflow_data = {
            "id": self.workflow_id,
            "flags": {
                "is-update": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        assert (
            task_test(
                "hep_create_dag",
                "is_fresh_data",
                dag_params=self.context["params"],
            )
            is None
        )

    def test_is_fresh_data_returns_true_if_head_version_id_is_none(self):
        workflow_data = {
            "id": self.workflow_id,
            "flags": {
                "is-update": True,
            },
            "merge_details": None,
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        assert (
            task_test(
                "hep_create_dag",
                "is_fresh_data",
                dag_params=self.context["params"],
            )
            is None
        )

    @pytest.mark.vcr
    def test_create_curation_core_ticket(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test create curation core ticket"}],
                "acquisition_source": {"method": "hepcrawl", "source": "arXiv"},
                "_collections": ["Literature"],
            },
            "flags": {
                "needs-curation-core": True,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "core_selection.create_curation_core_ticket",
            dag_params=self.context["params"],
        )

        workflow = get_lit_workflow_task(self.workflow_id)

        assert get_ticket_by_type(workflow, TICKET_HEP_CURATION_CORE)

    @pytest.mark.vcr
    def test_store_root_new_record(self):
        record = get_inspire_http_record(LITERATURE_PID_TYPE, 99999)
        head_uuid = record["uuid"]

        root = {"version": "original", "acquisition_source": {"source": "arXiv"}}

        workflow_data = {
            "id": self.workflow_id,
            "merge_details": {"head_uuid": head_uuid},
        }

        preserverd_root_entry = {
            "id": self.workflow_id,
            "data": root,
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        s3.write_workflow(
            self.s3_hook, preserverd_root_entry, self.bucket_name, filename="root.json"
        )

        task_test(
            "hep_create_dag",
            "store_root",
            dag_params=self.context["params"],
        )

    @pytest.mark.vcr
    def test_store_root_update_record(self):
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
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)
        s3.write_workflow(
            self.s3_hook, preserved_root_entry, self.bucket_name, filename="root.json"
        )

        task_test(
            "hep_create_dag",
            "store_root",
            dag_params=self.context["params"],
        )

        root_entry = function_test(
            workflows.read_wf_record_source,
            params={"record_uuid": head_uuid, "source_name": "arxiv"},
        )

        assert root_entry["json"] == root

        root["version"] = "modified"
        preserved_root_entry = {
            "id": self.workflow_id,
            "data": root,
        }

        s3.write_workflow(
            self.s3_hook, preserved_root_entry, self.bucket_name, filename="root.json"
        )

        task_test(
            "hep_create_dag",
            "store_root",
            dag_params=self.context["params"],
        )

        root_entry = function_test(
            workflows.read_wf_record_source,
            params={"record_uuid": head_uuid, "source_name": "arxiv"},
        )

        assert root_entry["json"] == root

    @pytest.mark.vcr
    def test_store_record_create(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "$schema": "https://inspirehep.net/schemas/records/hep.json",
                "_collections": ["Literature"],
                "document_type": ["article"],
                "titles": [{"title": "Test store record create"}],
            },
            "flags": {
                "is-update": False,
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "store_record",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert "control_number" in workflow_result["data"]

    @pytest.mark.vcr
    def test_store_record_update(self):
        initial_record_data = get_inspire_http_record(LITERATURE_PID_TYPE, 10000)

        workflow_data = {
            "data": copy.deepcopy(initial_record_data["metadata"]),
            "flags": {
                "is-update": True,
            },
            "merge_details": {
                "head_version_id": initial_record_data["revision_id"] + 1
            },
        }
        workflow_data["data"]["titles"].append(
            {"title": f"An additional title {initial_record_data['revision_id']}"}
        )
        workflow_data["id"] = self.workflow_id

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "store_record",
            dag_params=self.context["params"],
        )

        record_data = get_inspire_http_record(LITERATURE_PID_TYPE, 10000)

        assert (
            len(record_data["metadata"]["titles"])
            == len(initial_record_data["metadata"]["titles"]) + 1
        )
        assert initial_record_data["revision_id"] + 1 == record_data["revision_id"]

    @pytest.mark.vcr
    def test_store_record_does_not_raise_in_the_orcid_receiver(self):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "$schema": "http://localhost:5000/schemas/records/hep.json",
                "_collections": [
                    "Literature",
                ],
                "authors": [
                    {
                        "full_name": "Patra, Asim",
                        "ids": [
                            {
                                "schema": "ORCID",
                                "value": "0000-0003-1166-2790",
                            },
                        ],
                    },
                ],
                "document_type": [
                    "article",
                ],
                "titles": [
                    {"title": "title"},
                ],
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "store_record",
            dag_params=self.context["params"],
        )

    @pytest.mark.vcr
    def test_store_record_update_no_control_number(self):
        initial_record_data = get_inspire_http_record(LITERATURE_PID_TYPE, 10000)

        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "$schema": "https://inspirehep.net/schemas/records/hep.json",
                "_collections": ["Literature"],
                "document_type": ["article"],
                "titles": [{"title": "Test store record create"}],
            },
            "merge_details": {
                "head_version_id": initial_record_data["revision_id"] + 1
            },
            "flags": {
                "is-update": True,
            },
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        with pytest.raises(ValueError, match="Control number is missing"):
            task_test(
                "hep_create_dag", "store_record", dag_params=self.context["params"]
            )

    @pytest.mark.parametrize(
        ("decision", "is_core"),
        [
            (DECISION_CORE_SELECTION_ACCEPT_CORE, True),
            (DECISION_CORE_SELECTION_ACCEPT, False),
        ],
    )
    @pytest.mark.vcr
    def test_load_record_from_hep(self, decision, is_core):
        workflow_data = {
            "id": self.workflow_id,
            "data": {"control_number": 44707},
            "decisions": [{"action": decision}],
        }

        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "core_selection.load_record_from_hep",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert "titles" in workflow_result["data"]
        assert workflow_result["data"]["core"] is is_core

    def test_check_is_auto_approved_true(self):
        workflow_data = {
            "id": self.workflow_id,
            "flags": {
                "auto-approved": True,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            dag_id="hep_create_dag",
            task_id="halt_for_approval_if_new_or_reject_if_not_relevant.check_is_auto_approved",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert (
            "halt_for_approval_if_new_or_reject_if_not_relevant.halt_end"
            in result["followed"]
        )
        assert get_flag("approved", workflow_result) is True

    def test_check_is_auto_approved_false(self):
        workflow_data = {
            "id": self.workflow_id,
            "flags": {
                "auto-approved": False,
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        result = task_test(
            dag_id="hep_create_dag",
            task_id="halt_for_approval_if_new_or_reject_if_not_relevant.check_is_auto_approved",
            dag_params=self.context["params"],
        )

        workflow_result = s3.read_workflow(
            self.s3_hook, self.bucket_name, self.workflow_id
        )

        assert (
            result
            == "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant"
        )
        assert get_flag("approved", workflow_result) is not True

    @pytest.mark.vcr
    def test_validate_record_no_error(self):
        task_test(
            "hep_create_dag",
            "postprocessing.validate_record",
            dag_params=self.context["params"],
        )

    @pytest.mark.vcr
    def test_validate_record_raises_and_stops(self):
        workflow_id = "f98f33b2-39c6-47bc-b8a5-45dc91953caa"

        with pytest.raises(AirflowFailException) as excinfo:
            task_test(
                "hep_create_dag",
                "postprocessing.validate_record",
                dag_params={"workflow_id": workflow_id},
            )

        assert "Validation failed" in str(excinfo.value)

    @patch(
        "include.utils.workflows.find_matching_workflows",
        return_value=[
            {
                "id": "to_block",
                "data": {
                    "acquisition_source": {
                        "method": "hepcrawl",
                        "source": "arXiv",
                    },
                    "arxiv_eprints": [
                        {
                            "value": "1111.11111",
                        }
                    ],
                },
                "_created_at": "2025-11-02T00:00:00.000Z",
            },
            {
                "id": "to_restart",
                "data": {
                    "acquisition_source": {
                        "method": "hepcrawl",
                        "source": "arXiv",
                    },
                    "arxiv_eprints": [
                        {
                            "value": "1111.11111",
                        }
                    ],
                },
                "_created_at": "2025-11-01T00:00:00.000Z",
            },
        ],
    )
    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.restart_workflow"
    )
    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.block_workflow"
    )
    def test_run_next_if_necessary(
        self, block_workflow_mock, restart_workflow_mock, find_matching_workflows_mock
    ):
        workflow_data = {
            "id": self.workflow_id,
            "data": {
                "titles": [{"title": "test no next"}],
                "arxiv_eprints": [{"value": "1111.11111"}],
            },
        }
        s3.write_workflow(self.s3_hook, workflow_data, self.bucket_name)

        task_test(
            "hep_create_dag",
            "run_next_if_necessary",
            dag_params=self.context["params"],
        )

        block_workflow_mock.assert_called_once_with(
            "to_block", "Blocked by workflow to_restart"
        )
        restart_workflow_mock.assert_called_once_with("to_restart")
