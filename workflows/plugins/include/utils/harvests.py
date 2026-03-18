import logging

from include.utils.constants import HEP_CREATE

logger = logging.getLogger(__name__)


def load_records(parsed_records, workflow_management_hook):
    """Load the built records to the backoffice.
    Args:
        parsed_records (list): The list of built records.
        workflow_management_hook: The workflow management hook to use.
    Returns:
        list: The list of failed to load records.
    """
    failed_load_records = []
    for record in parsed_records:
        workflow_data = {
            "data": record,
            "workflow_type": HEP_CREATE,
        }
        try:
            workflow_management_hook.post_workflow(
                workflow_data=workflow_data,
            )
        except Exception:
            logger.exception(f"Failed to load record: {record}")
            failed_load_records.append(record)

    return failed_load_records
