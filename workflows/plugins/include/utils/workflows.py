from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from inspire_utils.dedupers import dedupe_list
from inspire_utils.record import get_value


def get_decision(decisions, action):
    for decision in decisions:
        if decision["action"] == action:
            return decision
    return None


def normalize_collaborations(workflow_data):
    inspire_http_hook = InspireHttpHook()

    collaborations = get_value(workflow_data, "collaborations", [])

    if not collaborations:
        return

    response = inspire_http_hook.call_api(
        endpoint="api/curation/literature/collaborations-normalization",
        method="GET",
        json={"collaborations": collaborations},
    )
    response.raise_for_status()
    obj_accelerator_experiments = workflow_data.get("accelerator_experiments", [])
    json_response = response.json()

    normalized_accelerator_experiments = json_response["accelerator_experiments"]

    if normalized_accelerator_experiments or obj_accelerator_experiments:
        accelerator_experiments = dedupe_list(
            obj_accelerator_experiments + normalized_accelerator_experiments
        )
        normalized_collaborations = json_response["normalized_collaborations"]

        return accelerator_experiments, normalized_collaborations
