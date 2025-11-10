import pytest
from airflow.models import DagBag
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from include.utils.s3 import read_object, write_object

dagbag = DagBag()

s3_hook = S3Hook(aws_conn_id="s3_conn")
bucket_name = Variable.get("s3_bucket_name")


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
