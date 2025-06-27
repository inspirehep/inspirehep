from backoffice.authors.constants import (
    AuthorCreateDags,
    AuthorUpdateDags,
)
from backoffice.authors.constants import WorkflowType
from backoffice.hep.constants import HepWorkflowType

WORKFLOW_DAGS = {
    HepWorkflowType.HEP_CREATE: "",
    HepWorkflowType.HEP_UPDATE: "",
    WorkflowType.AUTHOR_CREATE: AuthorCreateDags,
    WorkflowType.AUTHOR_UPDATE: AuthorUpdateDags,
}
