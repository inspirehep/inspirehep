from io import BytesIO
from unittest.mock import Mock, patch
from urllib.parse import urlparse

import pytest
from airflow.models import DagBag
from include.utils.s3 import S3JsonStore

from tests.test_utils import task_test

dagbag = DagBag()

APS_JATS_XML = """
<article article-type="research-article" xmlns:xlink="http://www.w3.org/1999/xlink">
  <front>
    <journal-meta>
      <journal-id journal-id-type="publisher-id">PRD</journal-id>
      <journal-title-group>
        <journal-title>Physical Review D</journal-title>
        <abbrev-journal-title>Phys. Rev. D</abbrev-journal-title>
      </journal-title-group>
      <issn pub-type="ppub">2470-0010</issn>
      <issn pub-type="epub">2470-0029</issn>
      <publisher>
        <publisher-name>Example Physics Publisher</publisher-name>
      </publisher>
    </journal-meta>
    <article-meta>
      <article-id pub-id-type="doi">10.1103/3yn8-xxrx</article-id>
      <title-group>
        <article-title>Example constraints from a resonant</article-title>
      </title-group>
      <contrib-group>
        <contrib contrib-type="author">
          <contrib-id authenticated="true" contrib-id-type="orcid">https://orcid.org/0000-0001-2345-6789</contrib-id>
          <name>
            <surname>Doe</surname>
            <given-names>Alex</given-names>
          </name>
        </contrib>
      </contrib-group>
      <volume>113</volume>
      <issue>5</issue>
      <elocation-id>052013</elocation-id>
      <permissions>
        <copyright-statement>Published by the example</copyright-statement>
        <copyright-year>2026</copyright-year>
        <copyright-holder>authors</copyright-holder>
      </permissions>
      <abstract>
        <p>The dark photon is a well motivated candidate for the dark.</p>
      </abstract>
    </article-meta>
  </front>
</article>
"""


@pytest.mark.usefixtures("hep_env")
class TestAPSHarvest:
    dag = dagbag.get_dag("aps_harvest_dag")

    s3_aps_store = S3JsonStore("s3_publisher_conn", bucket_name="aps-store")

    @pytest.mark.vcr
    def test_fetch_articles(self):
        s3_key = task_test(
            self.dag,
            "fetch_articles",
            context={
                "params": {
                    "from": "2026-03-26",
                    "until": "2026-03-27",
                    "set": "openaccess",
                    "per_page": 50,
                    "date": "published",
                },
                "run_id": "test_run_id",
            },
        )
        payload = self.s3_aps_store.read_object(s3_key)

        assert "articles" in payload
        assert payload["articles"]
        assert len(payload["articles"]) > 50
        assert all("identifiers" in article for article in payload["articles"])
        assert all(article["identifiers"].get("doi") for article in payload["articles"])

    @patch(
        "hooks.backoffice.workflow_management_hook.WorkflowManagementHook.post_workflow"
    )
    @patch("hooks.generic_http_hook.GenericHttpHook.call_api")
    def test_process_articles(self, mock_call_api, mock_post_workflow):
        harvest_key = self.s3_aps_store.write_object(
            {"articles": [{"identifiers": {"doi": "10.1234/test"}}]}
        )

        response = Mock()
        response.text = APS_JATS_XML
        download_response = Mock()
        download_response.raw = BytesIO(APS_JATS_XML.encode("utf-8"))
        mock_call_api.side_effect = [response, download_response]

        failed_records_key = task_test(
            self.dag,
            "process_articles",
            params={"s3_harvest_key": harvest_key},
            context={"run_id": "test_run_id"},
        )

        failures = self.s3_aps_store.read_object(failed_records_key)

        assert failures == {"failed_records": []}
        assert mock_post_workflow.call_count == 1
        stored_document_path = urlparse(
            mock_post_workflow.call_args.kwargs["workflow_data"]["data"]["documents"][
                0
            ]["url"]
        ).path
        assert stored_document_path.startswith(
            f"/{self.s3_aps_store.bucket_name}/documents/"
        )
        assert stored_document_path.endswith("/10.1234/test.xml")
        assert (
            self.s3_aps_store.hook.get_key(
                stored_document_path.removeprefix(f"/{self.s3_aps_store.bucket_name}/"),
                self.s3_aps_store.bucket_name,
            )
            is not None
        )
        assert (
            mock_post_workflow.call_args.kwargs["workflow_data"]["data"]["documents"][
                0
            ]["original_url"]
            == "http://harvest.aps.org/v2/journals/articles/10.1234/test"
        )
