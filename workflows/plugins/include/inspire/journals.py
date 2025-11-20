from airflow.exceptions import AirflowException
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils.constants import JOURNALS_PID_TYPE
from inspire_utils.helpers import maybe_int
from inspire_utils.record import get_value


def get_db_journals(data):
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
    journals = get_value(data, "publication_info.journal_record.$ref", [])
    if not journals:
        return []

    journal_ids = [maybe_int(journal.split("/")[-1]) for journal in journals]

    db_journals = []
    for journal_id in journal_ids:
        try:
            record = inspire_http_record_management_hook.get_record(
                pid_type=JOURNALS_PID_TYPE,
                control_number=journal_id,
            )
            db_journals.append(record["metadata"])
        except AirflowException:
            pass

    return db_journals
