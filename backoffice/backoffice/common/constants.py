from backoffice.authors.constants import (
    AuthorCreateDags,
    AuthorUpdateDags,
)
from backoffice.authors.constants import AuthorWorkflowType
from backoffice.hep.constants import HepWorkflowType, HepCreateDags

WORKFLOW_DAGS = {
    HepWorkflowType.HEP_CREATE: HepCreateDags,
    HepWorkflowType.HEP_SUBMISSION: HepCreateDags,
    HepWorkflowType.HEP_UPDATE: HepCreateDags,
    AuthorWorkflowType.AUTHOR_CREATE: AuthorCreateDags,
    AuthorWorkflowType.AUTHOR_UPDATE: AuthorUpdateDags,
}


APPLICATION_VND_INSPIREHEP_JSON = "application/vnd.inspirehep.backoffice-ui+json"
