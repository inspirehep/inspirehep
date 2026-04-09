import datetime
import logging

from airflow.sdk import Param, dag, task
from airflow.sdk.execution_time.macros import ds_add
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from include.utils.alerts import FailedDagNotifier
from include.utils.cds_harvest import build_records
from include.utils.constants import HEP_PUBLISHER_CREATE
from include.utils.harvests import fetch_records_oaipmh, load_records
from include.utils.s3 import S3JsonStore
from literature.check_failures_task import check_failures
from literature.oai_harvest_tasks import get_sets

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="20 10 * * 1",
    catchup=False,
    tags=["literature", "cds", "harvest"],
    params={
        "metadata_prefix": Param(type=["null", "string"], default="marcxml"),
        "from": Param(type=["null", "string"], default=None),
        "until": Param(type=["null", "string"], default=None),
        "sets": Param(
            type="array",
            default=[
                "cerncds:atlas-pub",
                "cerncds:lhcb-conf",
                "cerncds:cms-pas",
                "cerncds:atlas-conf",
                "cerncds:lhcb-pub",
                "cerncds:alice-pub",
                "forINSPIRE",
            ],
        ),
    },
    on_failure_callback=FailedDagNotifier(),
)
def cds_literature_harvest_dag():
    """Harvest CDS MARCXML records over OAI-PMH and create literature workflows."""

    @task
    def process_records(sets, **context):
        workflow_management_hook = WorkflowManagementHook(HEP)
        s3_store = S3JsonStore(aws_conn_id="s3_conn")

        from_date = context["params"]["from"] or ds_add(context["ds"], -8)
        until_date = context["params"]["until"]

        logger.info(f"Fetching records with sets={sets}")

        xml_records = fetch_records_oaipmh(
            connection_id="cds_oaipmh_connection",
            metadata_prefix=context["params"]["metadata_prefix"],
            sets=sets,
            from_date=from_date,
            until_date=until_date,
        )

        parsed_records, failed_build_records = build_records(
            xml_records,
            context["run_id"],
        )
        failed_load_records = load_records(
            parsed_records,
            workflow_management_hook,
            workflow_type=HEP_PUBLISHER_CREATE,
        )

        return s3_store.write_object(
            {
                "failed_build_records": failed_build_records,
                "failed_load_records": failed_load_records,
            }
        )

    sets = get_sets()
    failed_record_key = process_records(sets)
    check_failures(failed_record_key)


cds_literature_harvest_dag()
