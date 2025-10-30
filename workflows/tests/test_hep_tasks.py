from urllib.parse import urlparse

import pytest
from airflow.exceptions import AirflowException
from airflow.models import DagBag
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from botocore.exceptions import ClientError
from hooks.backoffice.workflow_management_hook import (
    HEP,
    WorkflowManagementHook,
)
from include.utils.s3 import read_object, write_object
from inspire_schemas.api import load_schema, validate

from tests.test_utils import task_test

dagbag = DagBag()

s3_hook = S3Hook(aws_conn_id="s3_conn")
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
    def test_check_for_blocking_workflows_block_arxivid(self):
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
    def test_check_for_blocking_workflows_block_doi(self):
        task = self.dag.get_task("check_for_blocking_workflows")

        write_object(
            s3_hook,
            {
                "data": {
                    "dois": [
                        {
                            "value": "10.1016/j.physletb.2025.139959",
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
    def test_check_for_exact_matches_no_match(self):
        write_object(
            s3_hook,
            {"data": {"arxiv_eprints": [{"value": "1801.00000"}]}},
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )

        result = task_test(
            "hep_create_dag",
            "check_for_exact_matches",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "get_fuzzy_matches" in result["followed"]

    @pytest.mark.vcr
    def test_check_for_exact_matches_one_match(self):
        write_object(
            s3_hook,
            {"data": {"arxiv_eprints": [{"value": "1801.07224"}]}},
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )

        result = task_test(
            "hep_create_dag",
            "check_for_exact_matches",
            dag_params=self.context["params"],
            xcom_key="skipmixin_key",
        )

        assert "set_update_flag" in result["followed"]

    @pytest.mark.vcr
    def test_check_for_exact_matches_multi_match(self):
        write_object(
            s3_hook,
            {
                "data": {
                    "dois": [
                        {"value": "10.1103/PhysRevD.95.094515", "source": "APS"},
                        {"value": "10.1103/PhysRevD.95.094515"},
                    ],
                    "arxiv_eprints": [
                        {"value": "1601.03071", "categories": ["hep-lat", "hep-ph"]}
                    ],
                }
            },
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )

        with pytest.raises(AirflowException):
            task_test(
                "hep_create_dag",
                "check_for_exact_matches",
                dag_params=self.context["params"],
            )

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
    def test_extract_journal_info(self):
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
        task = self.dag.get_task("preprocessing.extract_journal_info")
        task.python_callable(params=self.context["params"])

        updated = read_object(s3_hook, bucket_name, s3_key)
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
        validate(workflow_data["data"]["arxiv_eprints"], eprints_subschema)

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.arxiv_author_list",
            params={"tarball_key": f"{self.context['params']['workflow_id']}-notfound"},
            dag_params=self.context["params"],
        )

    def test_arxiv_author_list_handles_multiple_author_xml_files(self, datadir):
        schema = load_schema("hep")
        eprints_subschema = schema["properties"]["arxiv_eprints"]

        tarball_name = "1703.09986.multiple_author_lists.tar.gz"

        tarball_key = f"{self.context['params']['workflow_id']}-{tarball_name}"

        s3_hook.load_file(
            (datadir / tarball_name),
            tarball_key,
            bucket_name,
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

        workflow_result = read_object(
            s3_hook, bucket_name, self.context["params"]["workflow_id"]
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

        tarball_key = f"{self.context['params']['workflow_id']}-{tarball_name}"

        s3_hook.load_file(
            (datadir / tarball_name),
            tarball_key,
            bucket_name,
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

        workflow_result = read_object(
            s3_hook, bucket_name, self.context["params"]["workflow_id"]
        )
        assert workflow_result["data"]["authors"] == expected_authors

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
            dag_params=self.context["params"],
        )

        assert "preprocessing.populate_arxiv_document" in res

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
            dag_params=self.context["params"],
        )

        assert "preprocessing.download_documents" in res

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

        workflow_data = {"data": {}}

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )
        task_test(
            "hep_create_dag",
            "preprocessing.arxiv_plot_extract",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)

        plots = workflow_result["data"]["figures"]
        assert len(plots) == 20
        for plot in plots:
            assert plot["key"].endswith(".png")

    def test_arxiv_plot_extract_populates_files_with_plots(self, datadir):
        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]

        tarball_key = f"{self.context['params']['workflow_id']}-test"
        s3_hook.load_file(
            (datadir / "0804.1873.tar.gz"),
            tarball_key,
            bucket_name,
            replace=True,
        )

        workflow_data = {
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "nucl-ex",
                        ],
                        "value": "0804.1873",
                    },
                ],
            }
        }
        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task_test(
            "hep_create_dag",
            "preprocessing.arxiv_plot_extract",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)

        expected = [
            {
                "url": "http://s3:9000/data-store/00000000-0000-0000-0000-000000001111-plots/0_figure1.png",
                "source": "arxiv",
                "material": "preprint",
                "key": "00000000-0000-0000-0000-000000001111-plots/0_figure1.png",
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

        tarball_key = f"{self.context['params']['workflow_id']}-test"
        s3_hook.load_file(
            (datadir / "0804.1873.tar.gz"),
            tarball_key,
            bucket_name,
            replace=True,
        )

        workflow_data = {
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "nucl-ex",
                        ],
                        "value": "0804.1873",
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

            workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)
            expected_figures = [
                {
                    "url": "http://s3:9000/data-store/00000000-0000-0000-0000-000000001111-plots/0_figure1.png",
                    "source": "arxiv",
                    "material": "preprint",
                    "key": "00000000-0000-0000-0000-000000001111-plots/0_figure1.png",
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

        tarball_key = f"{self.context['params']['workflow_id']}-test"
        s3_hook.load_file(
            (datadir / "1711.10662.tar.gz"),
            tarball_key,
            bucket_name,
            replace=True,
        )

        workflow_data = {
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "cs.CV",
                        ],
                        "value": "1711.10662",
                    },
                ]
            }
        }

        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )
        task_test(
            "hep_create_dag",
            "preprocessing.arxiv_plot_extract",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)
        assert len(workflow_result["data"]["figures"]) == 66

    def test_arxiv_plot_extract_logs_when_tarball_is_invalid(self, datadir):
        tarball_key = f"{self.context['params']['workflow_id']}-test"
        s3_hook.load_file(
            (datadir / "1612.00626"),
            tarball_key,
            bucket_name,
            replace=True,
        )

        workflow_data = {
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
            }
        }
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task_test(
            "hep_create_dag",
            "preprocessing.arxiv_plot_extract",
            params={"tarball_key": tarball_key},
            dag_params=self.context["params"],
        )

        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)

        assert "figures" not in workflow_result["data"]

    def test_arxiv_plot_extract_no_file(self):
        tarball_key = f"{self.context['params']['workflow_id']}-no-file"

        workflow_data = {
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "physics.ins-det",
                        ],
                        "value": "no.file",
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

        with pytest.raises(ClientError, match="Not Found"):
            task_test(
                "hep_create_dag",
                "preprocessing.arxiv_plot_extract",
                params={"tarball_key": tarball_key},
                dag_params=self.context["params"],
            )

    @pytest.mark.vcr
    def test_download_documents(self):
        filename = "1605.03844.pdf"
        workflow_data = {
            "data": {
                "documents": [
                    {
                        "key": filename,
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
            f"{self.workflow_id}-documents/{filename}", bucket_name
        )
        s3_hook.delete_objects(bucket_name, f"{self.workflow_id}-documents/{filename}")

        assert (
            urlparse(result["data"]["documents"][0]["url"]).path
            == f"/{bucket_name}/{self.workflow_id}-documents/{filename}"
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
            s3_hook.delete_objects(
                bucket_name, f"{self.workflow_id}-documents/{document_in['key']}"
            )
            assert (
                urlparse(document_out["url"]).path
                == f"/{bucket_name}/{self.workflow_id}-documents/{document_in['key']}"
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
    def test_populate_arxiv_document(self):
        workflow_data = {
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
            }
        }

        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]
        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task_test(
            "hep_create_dag",
            "preprocessing.populate_arxiv_document",
            params=None,
            dag_params=self.context["params"],
        )

        workflow_data = read_object(s3_hook, bucket_name, self.workflow_id)

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
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "physics.ins-det",
                        ],
                        "value": "1605.03844",
                    },
                ]
            }
        }

        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

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

        workflow_data = read_object(s3_hook, bucket_name, self.workflow_id)
        assert len(workflow_data["data"]["documents"]) == 1

    @pytest.mark.vcr
    def test_populate_arxiv_document_logs_on_pdf_not_existing(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["arxiv_eprints"]

        workflow_data = {
            "data": {
                "arxiv_eprints": [
                    {
                        "categories": [
                            "cs.CV",
                        ],
                        "value": "2412.13417",
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

        assert validate(workflow_data["data"]["arxiv_eprints"], subschema) is None

        task_test(
            "hep_create_dag",
            "preprocessing.populate_arxiv_document",
            dag_params=self.context["params"],
        )

        workflow_data = read_object(s3_hook, bucket_name, self.workflow_id)
        assert "documents" not in workflow_data["data"]

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

    @pytest.mark.vcr
    def test_refextract_from_raw_refs(self):
        schema = load_schema("hep")
        subschema = schema["properties"]["references"]
        workflow_data = {
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
            }
        }

        assert validate(workflow_data["data"]["references"], subschema) is None

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task_test(
            "hep_create_dag",
            "preprocessing.refextract",
            dag_params=self.context["params"],
        )

        workflow_result = read_object(
            s3_hook, bucket_name, self.context["params"]["workflow_id"]
        )

        assert len(workflow_result["data"]["references"]) == 4
        assert "reference" in workflow_result["data"]["references"][0]

    @pytest.mark.vcr
    def test_refextract_from_s3_pdf(self, datadir):
        filename = "1802.08709.pdf"

        s3_hook.load_file(
            str(datadir / filename),
            f"{self.workflow_id}-documents/{filename}",
            bucket_name,
            replace=True,
        )

        workflow_data = {
            "data": {
                "documents": [
                    {"key": filename},
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

        task_test(
            "hep_create_dag",
            "preprocessing.refextract",
            dag_params=self.context["params"],
        )

        workflow_result = read_object(
            s3_hook, bucket_name, self.context["params"]["workflow_id"]
        )

        assert len(workflow_result["data"]["references"]) == 50

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
            f"{self.workflow_id}-documents/{paper_with_unprintable_keywords}",
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

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_extract_authors_from_pdf_when_no_authors_in_metadata(self, datadir):
        pdf_file = "1802.08709.pdf"

        workflow_data = {
            "data": {
                "documents": [
                    {"key": pdf_file},
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
            (datadir / pdf_file),
            f"{self.workflow_id}-documents/{pdf_file}",
            bucket_name,
            replace=True,
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.extract_authors_from_pdf",
            dag_params={"workflow_id": self.workflow_id},
        )

        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)

        assert len(workflow_result["data"]["authors"]) == 169

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_extract_authors_from_pdf_number_of_authors_is_same_after_merge_with_grobid(
        self, datadir
    ):
        pdf_file = "1802.08709.pdf"

        workflow_data = {
            "data": {
                "authors": [{"full_name": "author 1"}],
                "documents": [
                    {"key": pdf_file},
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
            (datadir / pdf_file),
            f"{self.workflow_id}-documents/{pdf_file}",
            bucket_name,
            replace=True,
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.extract_authors_from_pdf",
            dag_params={"workflow_id": self.workflow_id},
        )
        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)
        assert len(workflow_result["data"]["authors"]) == 1

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_extract_authors_from_pdf_no_authors_in_metadata_and_no_authors_from_grobid(
        self, datadir
    ):
        pdf_file = "no_authors.pdf"

        workflow_data = {
            "data": {
                "documents": [
                    {"key": pdf_file},
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
            (datadir / pdf_file),
            f"{self.workflow_id}-documents/{pdf_file}",
            bucket_name,
            replace=True,
        )

        task_test(
            dag_id="hep_create_dag",
            task_id="preprocessing.extract_authors_from_pdf",
            dag_params={"workflow_id": self.workflow_id},
        )

        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)

        assert "authors" not in workflow_result["data"]

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_extract_authors_from_pdf_merges_grobid_affiliations(self, datadir):
        pdf_file = "1612.06414v1.pdf"

        workflow_data = {
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
            (datadir / pdf_file),
            f"{self.workflow_id}-documents/{pdf_file}",
            bucket_name,
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

        workflow_result = read_object(s3_hook, bucket_name, self.workflow_id)

        assert workflow_result["data"]["authors"] == expected_authors

    def test_guess_coreness(self):
        workflow_data = {
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
        }
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task_result = task_test(
            "hep_create_dag",
            "preprocessing.guess_coreness",
            dag_params=self.context["params"],
        )

        result = task_result["relevance_prediction"]

        assert isinstance(result, dict)
        assert "scores" in result
        assert "decision" in result
        assert result["decision"] in ["CORE", "Non-CORE", "Rejected"]
        assert "max_score" in result
        assert "relevance_score" in result

    @pytest.mark.vcr
    def test_save_and_complete_workflow(self):
        workflow_data = {
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
            "workflow_type": "HEP_CREATE",
            "status": "running",
        }
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.workflow_id,
            overwrite=True,
        )

        task_test(
            "hep_create_dag",
            "save_and_complete_workflow",
            dag_params=self.context["params"],
        )

        workflow_management_hook = WorkflowManagementHook(HEP)
        workflow = workflow_management_hook.get_workflow(self.workflow_id)
        assert workflow["status"] == "completed"
        assert workflow_data["data"] == workflow["data"]


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
