from backoffice.authors.constants import (
    AuthorCreateDags,
    AuthorUpdateDags,
)
from backoffice.authors.constants import AuthorWorkflowType
from backoffice.hep.constants import HepWorkflowType

WORKFLOW_DAGS = {
    HepWorkflowType.HEP_CREATE: "hep_create_dag",
    HepWorkflowType.HEP_UPDATE: "hep_update_dag",
    AuthorWorkflowType.AUTHOR_CREATE: AuthorCreateDags,
    AuthorWorkflowType.AUTHOR_UPDATE: AuthorUpdateDags,
}
