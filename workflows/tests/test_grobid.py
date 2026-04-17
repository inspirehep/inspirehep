import pytest
from airflow.models import DagBag
from include.utils import workflows

from tests.test_utils import task_test

dagbag = DagBag()


@pytest.mark.usefixtures("hep_env")
class TestsGrobid:
    workflow_id = "bf92a2c3-610c-4d9e-bb8f-5a20d519accc"

    dag = dagbag.get_dag("hep_create_dag")
    workflow = {
        "id": workflow_id,
        "data": {
            "documents": [
                {"key": "2601.07092.pdf", "url": "https://arxiv.org/pdf/2601.07092"}
            ]
        },
    }

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_post_pdf_to_grobid_process_header(self):
        self.s3_store.write_workflow(self.workflow)
        task_test(
            self.dag,
            "preprocessing.download_documents",
            context_params={"workflow_id": self.workflow_id},
        )
        grobid_response = workflows.post_pdf_to_grobid(
            self.workflow, self.s3_store.hook, process_fulltext=False
        )
        assert '<forename type="first">Yuliang</forename>' in grobid_response.text

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_post_pdf_to_grobid_process_fulltext(self):
        self.s3_store.write_workflow(self.workflow)
        task_test(
            self.dag,
            "preprocessing.download_documents",
            context_params={"workflow_id": self.workflow_id},
        )
        grobid_response = workflows.post_pdf_to_grobid(
            self.workflow, self.s3_store.hook, process_fulltext=True
        )
        assert (
            "Autonomous driving increasingly relies on Visual Question Answering"
            in grobid_response.text
        )

    @pytest.mark.vcr(match_on=["method", "scheme", "host", "port", "path", "query"])
    def test_get_fulltext(self):
        self.s3_store.write_workflow(self.workflow)
        task_test(
            self.dag,
            "preprocessing.download_documents",
            context_params={"workflow_id": self.workflow_id},
        )
        fulltext = workflows.get_fulltext(self.workflow, self.s3_store.hook)
        assert (
            "Autonomous driving increasingly relies on Visual Question Answering"
            in fulltext
        )
