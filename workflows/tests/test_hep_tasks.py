import pytest
from airflow.models import DagBag
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.utils.context import Context
from include.utils.s3 import read_object, write_object

from tests.test_utils import task_test

dagbag = DagBag()

s3_hook = S3Hook(aws_conn_id="s3_conn")
s3_conn = s3_hook.get_connection("s3_conn")
s3_creds = {
    "user": s3_conn.login,
    "secret": s3_conn.password,
    "host": s3_conn.extra_dejson.get("endpoint_url"),
}
bucket_name = Variable.get("s3_bucket_name")


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


class Test_HEPCreateDAG:
    dag = dagbag.get_dag("hep_create_dag")
    context = {
        "dag_run": {"run_id": "test_run"},
        "ti": {"xcom_push": lambda key, value: None},
        "params": {"workflow_id": "00000000-0000-0000-0000-000000001111"},
    }

    workflow_id = context["params"]["workflow_id"]

    @pytest.mark.vcr
    def test_get_workflow_data(self):
        task = self.dag.get_task("get_workflow_data")

        res = task.execute(context=self.context)
        assert res == self.context["params"]["workflow_id"]

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_block(self):
        task = self.dag.get_task("check_for_blocking_workflows")

        write_object(
            s3_hook,
            {
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "2507.26819",
                        }
                    ]
                }
            },
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        result = task.python_callable(params=self.context["params"])

        assert result is False

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_continue(self):
        task = self.dag.get_task("check_for_blocking_workflows")

        write_object(
            s3_hook,
            {
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "xxx",
                        }
                    ]
                }
            },
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        result = task.python_callable(params=self.context["params"])

        assert result

    @pytest.mark.vcr
    def test_await_decision_exact_match(self):
        task = self.dag.get_task("await_decision_exact_match")
        result = task.python_callable(params=self.context["params"])

        assert result == "set_workflow_status_to_running"

    def test_check_decision_exact_match(self):
        write_object(
            s3_hook,
            {"decisions": [{"action": "exact_match", "value": True}]},
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        task = self.dag.get_task("check_decision_exact_match")
        result = task.python_callable(params=self.context["params"])
        assert result == "set_update_flag"

    @pytest.mark.vcr
    def test_get_exact_matches(self):
        write_object(
            s3_hook,
            {"data": {"arxiv_eprints": [{"value": "1801.07224"}]}},
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        task = self.dag.get_task("get_exact_matches")
        result = task.python_callable(params=self.context["params"])
        assert 1649231 in result

    def test_check_for_exact_matches(self):
        task = self.dag.get_task("check_for_exact_matches")
        result = task.python_callable(params=self.context["params"], matches=[])
        assert result == "dummy_get_fuzzy_matches"

        result = task.python_callable(params=self.context["params"], matches=[1])
        assert result == "dummy_set_update_flag"

        result = task.python_callable(params=self.context["params"], matches=[1, 2])
        assert result == "await_decision_exact_match"

    @pytest.mark.vcr
    def test_normalize_collaborations(self):
        task = self.dag.get_task("preprocessing.normalize_collaborations")
        workflow_data = {
            "collaborations": [{"value": "ETM"}],
            "acquisition_source": {"submission_number": "123"},
        }
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )

        accelerator_experiments, collaborations = task.python_callable(
            params=self.context["params"]
        )

        assert "record" in accelerator_experiments[0]
        assert accelerator_experiments[0]["legacy_name"] == "LATTICE-ETM"
        assert collaborations[0]["value"] == "ETM"

    @pytest.mark.vcr
    def test_fetch_and_extract_journal_info(self):
        workflow_data = {
            "data": {
                "publication_info": [
                    {"pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970"},
                    {"pubinfo_freetext": "Phys.Rev.Lett. 127 (1962) 965-970"},
                ],
            }
        }
        s3_key = self.context["params"]["workflow_id"]
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            s3_key,
            overwrite=True,
        )
        task = self.dag.get_task("preprocessing.fetch_and_extract_journal_info")
        task.python_callable(params=self.context["params"])

        updated = read_object(s3_hook, bucket_name, s3_key)
        assert "refextract" in updated
        assert len(updated["refextract"]) == 2

    def test_process_journal_info(self):
        s3_key = self.context["params"]["workflow_id"]
        workflow_data = {
            "data": {
                "publication_info": [
                    {"pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970"},
                    {"pubinfo_freetext": "Phys.Rev.Lett. 127 (1962) 965-970"},
                ],
            },
            "refextract": [
                {
                    "extra_ibids": [],
                    "is_ibid": False,
                    "misc_txt": "",
                    "page": "965-970",
                    "title": "Phys.Rev.",
                    "type": "JOURNAL",
                    "volume": "127",
                    "year": "1962",
                },
                {
                    "extra_ibids": [],
                    "is_ibid": False,
                    "misc_txt": "",
                    "page": "965-970",
                    "title": "Phys.Rev.Lett.",
                    "type": "JOURNAL",
                    "volume": "127",
                    "year": "1962",
                },
            ],
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            s3_key,
            overwrite=True,
        )

        task = self.dag.get_task("preprocessing.process_journal_info")
        task.op_args = (s3_creds, bucket_name, s3_key)
        task.execute(context=Context())

        updated = read_object(s3_hook, bucket_name, s3_key)
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
        task = self.dag.get_task("preprocessing.arxiv_package_download")
        write_object(
            s3_hook,
            {
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "2508.17630",
                        }
                    ]
                }
            },
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        res = task.execute(context=self.context)
        assert res == f"{self.context['params']['workflow_id']}-2508.17630.tar.gz"

    def test_check_is_arxiv_paper(self):
        workflow_data = {
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

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        res = task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.check_is_arxiv_paper",
            params={
                "workflow_id": self.workflow_id,
                "s3_creds": s3_creds,
                "bucket_name": bucket_name,
            },
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "preprocessing.arxiv_package_download" in res["followed"]

    def test_check_is_not_arxiv_paper(self):
        workflow_data = {
            "data": {
                "acquisition_source": {
                    "method": "not_hepcrawl",
                    "source": "not_arXiv",
                    "datetime": "2025-08-29T04:01:43.201583",
                    "submission_number": "10260051",
                }
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        res = task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.check_is_arxiv_paper",
            params={
                "workflow_id": self.workflow_id,
                "s3_creds": s3_creds,
                "bucket_name": bucket_name,
            },
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "preprocessing.download_documents" in res["followed"]

    @pytest.mark.vcr
    def test_populate_journal_coverage(self):
        task = self.dag.get_task("preprocessing.populate_journal_coverage")
        workflow_id = self.context["params"]["workflow_id"]
        workflow_data = {
            "data": {
                "publication_info": [
                    {
                        "journal_record": {
                            "$ref": "https://localhost:8080/api/journals/1214516"
                        }
                    }
                ]
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            workflow_id,
            overwrite=True,
        )
        task.python_callable(params=self.context["params"])

        result = read_object(s3_hook, bucket_name, workflow_id)
        assert "partial" in result["journal_coverage"]

    @pytest.mark.vcr
    def test_populate_journal_coverage_picks_full_if_exists(self):
        task = self.dag.get_task("preprocessing.populate_journal_coverage")
        workflow_id = self.context["params"]["workflow_id"]
        workflow_data = {
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
                ]
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            workflow_id,
            overwrite=True,
        )
        task.python_callable(params=self.context["params"])

        result = read_object(s3_hook, bucket_name, workflow_id)
        assert "full" in result["journal_coverage"]

    def test_arxiv_plot_extract(self, datadir):
        tarball_key = f"{self.context['params']['workflow_id']}-test"
        s3_hook.load_file(
            (datadir / "arXiv-2509.06062v1.tar.gz"),
            tarball_key,
            bucket_name,
            replace=True,
        )
        task = self.dag.get_task("preprocessing.arxiv_plot_extract")

        results = task.python_callable(
            params=self.context["params"], tarball_key=tarball_key
        )
        assert len(results) == 20
        assert all(plot.endswith(".png") for plot in results)

    @pytest.mark.vcr
    def test_download_documents(self):
        workflow_data = {
            "data": {
                "documents": [
                    {
                        "key": "1605.03844.pdf",
                        "url": "https://arxiv.org/pdf/1605.03844",
                    },
                ],
            }
        }  # literature/1458302

        # TODO uncomment once inspire-schemas is added
        # schema = load_schema('hep')
        # subschema = schema['properties']['documents']
        # assert validate(data['documents'], subschema) is None

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task_test(
            "hep_create_dag",
            "preprocessing.download_documents",
            dag_params=self.context["params"],
        )

        result = read_object(s3_hook, bucket_name, self.workflow_id)

        assert s3_hook.check_for_key(
            f"{self.workflow_id}-documents/1605.03844.pdf", bucket_name
        )
        assert result["data"]["documents"][0]["url"] == (
            f"s3://{bucket_name}/{self.workflow_id}-documents/1605.03844.pdf"
        )

    @pytest.mark.vcr
    def test_download_documents_with_multiple_documents(self):
        workflow_data = {
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
                ],
            }
        }  # literature/1458302

        # TODO uncomment once inspire-schemas is added
        # schema = load_schema('hep')
        # subschema = schema['properties']['documents']
        # assert validate(data['documents'], subschema) is None

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task_test(
            "hep_create_dag",
            "preprocessing.download_documents",
            dag_params=self.context["params"],
        )

        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)

        for document_in, document_out in zip(
            workflow_data["data"]["documents"],
            workflow_result["data"]["documents"],
            strict=False,
        ):
            assert s3_hook.check_for_key(
                f"{self.workflow_id}-documents/{document_in['key']}", bucket_name
            )
            assert document_out["url"] == (
                f"s3://{bucket_name}/{self.workflow_id}-documents/{document_in['key']}"
            )

    @pytest.mark.vcr
    def test_count_reference_coreness(self):
        task = self.dag.get_task("preprocessing.count_reference_coreness")
        workflow_id = self.context["params"]["workflow_id"]
        workflow_data = {
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
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            workflow_id,
            overwrite=True,
        )
        task.python_callable(params=self.context["params"])

        result = read_object(s3_hook, bucket_name, workflow_id)
        assert result["reference_count"]["core"] == 2
        assert result["reference_count"]["non_core"] == 1

    @pytest.mark.vcr
    def test_normalize_journal_titles_with_empty_data(self):
        """Test the normalize_journal_titles Airflow task with
        empty publication_info."""
        task = self.dag.get_task("preprocessing.normalize_journal_titles")
        workflow_id = self.context["params"]["workflow_id"]

        workflow_data = {"data": {}}

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            workflow_id,
            overwrite=True,
        )

        result = task.python_callable(params=self.context["params"])

        assert result is None

        updated_data = read_object(s3_hook, bucket_name, workflow_id)
        assert "data" in updated_data
        assert updated_data["data"] == {}

    @pytest.mark.vcr
    def test_normalize_journal_titles_with_data(self):
        """Test the normalize_journal_titles Airflow task with publication_info."""
        task = self.dag.get_task("preprocessing.normalize_journal_titles")
        workflow_id = self.context["params"]["workflow_id"]

        workflow_data = {
            "data": {
                "publication_info": [
                    {"journal_title": "Phys. Rev. D"},
                    {"journal_title": "Journal of High Energy Physics"},
                    {"cnum": "C01-01-01"},
                ]
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            workflow_id,
            overwrite=True,
        )

        result = task.python_callable(params=self.context["params"])

        assert result is None

        updated_data = read_object(s3_hook, bucket_name, workflow_id)

        assert "data" in updated_data
        assert "publication_info" in updated_data["data"]
        assert len(updated_data["data"]["publication_info"]) == 3

        pub_info = updated_data["data"]["publication_info"]
        assert "journal_title" in pub_info[0]
        assert "journal_record" not in pub_info[0]
        assert "journal_title" in pub_info[1]
        assert "journal_record" in pub_info[1]
        assert "cnum" in pub_info[2]

    def test_classify_paper_with_fulltext(self, tmpdir, higgs_ontology):
        fulltext_name = "fulltext.txt"
        fulltext = tmpdir.join(fulltext_name)
        fulltext.write("Higgs boson")

        s3_hook.load_file(
            fulltext,
            f"{self.context['params']['workflow_id']}-documents/{fulltext_name}",
            bucket_name,
            replace=True,
        )

        workflow_data = {
            "data": {
                "documents": [
                    {"key": fulltext_name},
                ],
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        expected_fulltext_keywords = [{"number": 1, "keyword": "Higgs particle"}]

        result = task_test(
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

        assert (
            result["classifier_results"]["complete_output"]["core_keywords"]
            == expected_fulltext_keywords
        )
        assert result["classifier_results"]["fulltext_used"] is True
        assert "extracted_keywords" not in result

    def test_classify_paper_with_no_fulltext(self, higgs_ontology):
        write_object(
            s3_hook,
            {
                "data": {
                    "titles": [
                        {
                            "title": "Some title",
                        },
                    ],
                    "abstracts": [
                        {"value": "Very interesting paper about the Higgs boson."},
                    ],
                }
            },
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        expected_kewords = [{"number": 1, "keyword": "Higgs particle"}]

        result = task_test(
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

        assert (
            result["classifier_results"]["complete_output"]["core_keywords"]
            == expected_kewords
        )
        assert result["classifier_results"]["fulltext_used"] is False

    def test_classify_paper_uses_keywords(self, higgs_ontology):
        write_object(
            s3_hook,
            {
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
                }
            },
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        expected = [{"number": 1, "keyword": "Higgs particle"}]

        result = task_test(
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

        assert (
            result["classifier_results"]["complete_output"]["core_keywords"] == expected
        )
        assert result["classifier_results"]["fulltext_used"] is False

    def test_classify_paper_does_not_raise_on_unprintable_keywords(
        self, datadir, higgs_ontology
    ):
        paper_with_unprintable_keywords = "1802.08709.pdf"

        workflow_data = {
            "data": {
                "documents": [
                    {"key": paper_with_unprintable_keywords},
                ],
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        s3_hook.load_file(
            (datadir / paper_with_unprintable_keywords),
            paper_with_unprintable_keywords,
            bucket_name,
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
            }
        }

        s3_hook.load_file(
            fulltext,
            f"{self.context['params']['workflow_id']}-documents/{fulltext_name}",
            bucket_name,
            replace=True,
        )

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        expected_keywords = [{"number": 1, "keyword": "Core Keyword"}]

        result = task_test(
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

        assert (
            result["classifier_results"]["complete_output"]["core_keywords"]
            == expected_keywords
        )

        assert result["classifier_results"]["fulltext_used"] is True


class TestNormalizeJournalTitles:
    """Test class for normalize_journal_titles function logic using Airflow task."""

    dag = dagbag.get_dag("hep_create_dag")
    context = {
        "dag_run": {"run_id": "test_run"},
        "ti": {"xcom_push": lambda key, value: None},
        "params": {"workflow_id": "00000000-0000-0000-0000-000000002222"},
    }
    workflow_id = context["params"]["workflow_id"]

    @pytest.mark.vcr
    def test_normalize_journal_titles_known_journals_with_ref(self):
        """Test normalizing known journals with existing journal records."""

        task = self.dag.get_task("preprocessing.normalize_journal_titles")

        workflow_data = {
            "data": {
                "publication_info": [
                    {
                        "journal_title": "A Test Journal1",
                        "journal_record": {
                            "$ref": "http://localhost:5000/api/journals/1936475"
                        },
                    },
                    {"cnum": "C01-01-01"},
                    {
                        "journal_title": "Test.Jou.2",
                        "journal_record": {
                            "$ref": "http://localhost:5000/api/journals/1936476"
                        },
                    },
                ],
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task.python_callable(params=self.context["params"])
        updated_data = read_object(s3_hook, bucket_name, self.workflow_id)

        assert "data" in updated_data
        assert "publication_info" in updated_data["data"]
        assert len(updated_data["data"]["publication_info"]) == 3

        pub_info = updated_data["data"]["publication_info"]

        assert "journal_record" in pub_info[0]
        assert "journal_record" in pub_info[2]
        assert "journal_title" in pub_info[0]
        assert "journal_title" in pub_info[2]

    @pytest.mark.vcr
    def test_normalize_journal_titles_known_journals_no_ref(self):
        """Test normalizing known journals without existing journal records."""

        task = self.dag.get_task("preprocessing.normalize_journal_titles")

        workflow_data = {
            "data": {
                "publication_info": [
                    {"journal_title": "A Test Journal1"},
                    {"cnum": "C01-01-01"},
                    {"journal_title": "Test.Jou.2"},
                ],
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task.python_callable(params=self.context["params"])
        updated_data = read_object(s3_hook, bucket_name, self.workflow_id)

        assert "data" in updated_data
        assert "publication_info" in updated_data["data"]
        assert len(updated_data["data"]["publication_info"]) == 3

        pub_info = updated_data["data"]["publication_info"]

        assert "journal_title" in pub_info[0]
        assert "journal_title" in pub_info[2]

    @pytest.mark.vcr
    def test_normalize_journal_titles_unknown_journals_with_ref(self):
        """Test normalizing unknown journals with existing journal records."""

        task = self.dag.get_task("preprocessing.normalize_journal_titles")

        workflow_data = {
            "data": {
                "publication_info": [
                    {
                        "journal_title": "Unknown1",
                        "journal_record": {
                            "$ref": "http://localhost:5000/api/journals/0000000"
                        },
                    },
                    {"cnum": "C01-01-01"},
                    {
                        "journal_title": "Unknown2",
                        "journal_record": {
                            "$ref": "http://localhost:5000/api/journals/1111111"
                        },
                    },
                ],
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task.python_callable(params=self.context["params"])
        updated_data = read_object(s3_hook, bucket_name, self.workflow_id)

        assert "data" in updated_data
        assert "publication_info" in updated_data["data"]
        assert len(updated_data["data"]["publication_info"]) == 3

        pub_info = updated_data["data"]["publication_info"]

        assert "journal_record" in pub_info[0]
        assert "journal_record" in pub_info[2]
        assert "journal_title" in pub_info[0]
        assert "journal_title" in pub_info[2]

    @pytest.mark.vcr
    def test_normalize_journal_titles_unknown_journals_no_ref(self):
        """Test normalizing unknown journals without existing journal records."""

        task = self.dag.get_task("preprocessing.normalize_journal_titles")

        workflow_data = {
            "data": {
                "publication_info": [
                    {"journal_title": "Unknown1"},
                    {"cnum": "C01-01-01"},
                    {"journal_title": "Unknown2"},
                ],
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task.python_callable(params=self.context["params"])

        updated_data = read_object(s3_hook, bucket_name, self.workflow_id)

        assert "data" in updated_data
        assert "publication_info" in updated_data["data"]
        assert len(updated_data["data"]["publication_info"]) == 3

        pub_info = updated_data["data"]["publication_info"]
        assert "journal_title" in pub_info[0]
        assert "journal_title" in pub_info[2]

    @pytest.mark.vcr
    def test_normalize_journal_titles_in_references(self):
        """Test normalizing journal titles in references."""

        task = self.dag.get_task("preprocessing.normalize_journal_titles")

        workflow_data = {
            "data": {
                "references": [
                    {
                        "reference": {
                            "publication_info": {
                                "journal_title": "A Test Journal1",
                            }
                        }
                    },
                    {
                        "reference": {
                            "publication_info": {
                                "journal_title": "Something not in db",
                            }
                        }
                    },
                ],
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )
        task.python_callable(params=self.context["params"])
        updated_data = read_object(s3_hook, bucket_name, self.workflow_id)
        assert "data" in updated_data
        assert "references" in updated_data["data"]
        assert len(updated_data["data"]["references"]) == 2

        refs = updated_data["data"]["references"]
        ref0_pub_info = refs[0]["reference"]["publication_info"]
        ref1_pub_info = refs[1]["reference"]["publication_info"]

        assert "journal_title" in ref0_pub_info
        assert "journal_title" in ref1_pub_info
