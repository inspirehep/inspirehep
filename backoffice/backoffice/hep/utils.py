from backoffice.hep.api.serializers import (
    HepChangeStatusSerializer,
)
from django.shortcuts import get_object_or_404

from backoffice.common import airflow_utils
from backoffice.hep.models import HepWorkflow

from backoffice.hep.constants import (
    HepWorkflowType,
)
from inspire_utils.record import get_value


def get_restored_hep_workflow_type(workflow):
    """Return the workflow type to restore based on current type and source data."""
    method = get_value(workflow.source_data, "acquisition_source.method", "")

    if method == "submitter":
        return HepWorkflowType.HEP_SUBMISSION

    if workflow.workflow_type in (
        HepWorkflowType.HEP_PUBLISHER_CREATE,
        HepWorkflowType.HEP_PUBLISHER_UPDATE,
    ):
        return HepWorkflowType.HEP_PUBLISHER_CREATE

    return HepWorkflowType.HEP_CREATE


def complete_workflow(id, data):
    serializer = HepChangeStatusSerializer(data=data)
    serializer.is_valid(raise_exception=True)

    note = serializer.validated_data.get("note", "")

    workflow = get_object_or_404(HepWorkflow, pk=id)
    airflow_utils.mark_airflow_dag_run_as_success(workflow, note=note)
    return workflow
