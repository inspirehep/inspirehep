import logging

logger = logging.getLogger(__name__)


def load_records(
    parsed_records,
    workflow_management_hook,
    workflow_type,
):
    """Load built records into backoffice workflows.

    Args:
        parsed_records (list): Built records to load.
        workflow_management_hook: Hook used to create workflows in backoffice.
        workflow_type (str): Workflow type assigned to each created workflow.

    Returns:
        list: Records that failed to load.
    """
    failed_load_records = []
    for record in parsed_records:
        workflow_data = {
            "data": record,
            "workflow_type": workflow_type,
        }
        try:
            workflow_management_hook.post_workflow(
                workflow_data=workflow_data,
            )
        except Exception:
            logger.exception(f"Failed to load record: {record}")
            failed_load_records.append(record)

    return failed_load_records
