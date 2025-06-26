from backoffice.authors.constants import (
    AuthorCreateDags,
    AuthorUpdateDags,
)
from backoffice.authors.constants import AuthorWorkflowType
from backoffice.hep.constants import HepWorkflowType

WORKFLOW_DAGS = {
    HepWorkflowType.HEP_CREATE: "",
    HepWorkflowType.HEP_UPDATE: "",
    AuthorWorkflowType.AUTHOR_CREATE: AuthorCreateDags,
    AuthorWorkflowType.AUTHOR_UPDATE: AuthorUpdateDags,
}
