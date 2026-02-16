LITERATURE_PID_TYPE = "literature"
JOURNALS_PID_TYPE = "journals"

DECISION_FUZZY_MATCH = "fuzzy_match"
DECISION_HEP_ACCEPT = "hep_accept"
DECISION_HEP_ACCEPT_CORE = "hep_accept_core"
DECISION_HEP_REJECT = "hep_reject"
DECISION_CORE_SELECTION_ACCEPT = "core_selection_accept"
DECISION_CORE_SELECTION_ACCEPT_CORE = "core_selection_accept_core"
DECISION_AUTO_ACCEPT_CORE = "auto_accept_core"
DECISION_AUTO_REJECT = "auto_reject"
DECISION_MERGE_APPROVE = "merge_approve"
DECISION_DISCARD = "discard"

HEP_CREATE = "HEP_CREATE"
HEP_UPDATE = "HEP_UPDATE"

STATUS_APPROVAL_CORE_SELECTION = "approval_core_selection"
STATUS_APPROVAL_FUZZY_MATCHING = "approval_fuzzy_matching"
STATUS_APPROVAL_MERGE = "approval_merge"
STATUS_APPROVAL = "approval"
STATUS_BLOCKED = "blocked"
STATUS_ERROR_MULTIPLE_EXACT_MATCHES = "error_multiple_exact_matches"
STATUS_ERROR_VALIDATION = "error_validation"
STATUS_ERROR = "error"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_MISSING_SUBJECT_FIELDS = "missing_subject_fields"

TICKET_HEP_CURATION_CORE = "hep_create_curation_core"
TICKET_HEP_PUBLISHER_CURATION_CORE = "hep_create_publisher_curation_core"
TICKET_HEP_SUBMISSION = "hep_submission"
TICKET_HEP_CURATION = "hep_create_curation"
TICKET_AUTHOR_CREATE = "author_create_user"
TICKET_AUTHOR_CURATION = "author_create_curation"

RUNNING_STATUSES = [
    STATUS_APPROVAL_CORE_SELECTION,
    STATUS_APPROVAL_FUZZY_MATCHING,
    STATUS_APPROVAL_MERGE,
    STATUS_APPROVAL,
    STATUS_ERROR_MULTIPLE_EXACT_MATCHES,
    STATUS_ERROR_VALIDATION,
    STATUS_ERROR,
    STATUS_RUNNING,
]
COMPLETED_STATUSES = [STATUS_COMPLETED]

AFFILIATIONS_TO_HIDDEN_COLLECTIONS_MAPPING = {
    "IN2P3": "HAL Hidden",
    "CPPM": "HAL Hidden",
    "GANIL": "HAL Hidden",
    "IJCLAB": "HAL Hidden",
    "IP2I": "HAL Hidden",
    "IPHC": "HAL Hidden",
    "L2IT": "HAL Hidden",
    "LNCA": "HAL Hidden",
    "LP2I": "HAL Hidden",
    "LPNHE": "HAL Hidden",
    "LPSC": "HAL Hidden",
    "LUPM": "HAL Hidden",
    "SUBATECH": "HAL Hidden",
    "BINETRUY": "HAL Hidden",
    "BINÉTRUY": "HAL Hidden",
    "ILANCE": "HAL Hidden",
    "DMLAB": "HAL Hidden",
    "RINGUET": "HAL Hidden",
    "YUASA": "HAL Hidden",
    "AICP": "HAL Hidden",
    "MODANE": "HAL Hidden",
    "LPCA": "HAL Hidden",
    "INFINIS": "HAL Hidden",
    "IRENE JOLIOT": "HAL Hidden",
    "IRÈNE JOLIOT": "HAL Hidden",
    "IONS LOURDS": "HAL Hidden",
    "ASTROPARTICULE ET COSMOLOGIE": "HAL Hidden",
    "UNIVERS ET PARTICULES": "HAL Hidden",
    "PLURIDISCIPLINAIRE HUBERT CURIEN": "HAL Hidden",
    "CERN": "CDS Hidden",
    "FERMILAB": "Fermilab",
}

ARXIV_CATEGORIES = {
    "core": ["hep-ex", "hep-lat", "hep-ph", "hep-th"],
    "non-core": [
        "astro-ph.CO",
        "astro-ph.HE",
        "gr-qc",
        "nucl-ex",
        "nucl-th",
        "physics.acc-ph",
        "physics.ins-det",
        "quant-ph",
    ],
}

DECISIONS = {
    "accept": "hep_accept",
    "reject": "hep_reject",
    "auto_accept_core": "auto_accept_core",
    "auto_reject": "auto_reject",
}
