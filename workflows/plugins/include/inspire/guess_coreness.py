API_CORE = "core"
API_NON_CORE = "non_core"
API_REJECTED = "rejected"

CORE = "CORE"
NON_CORE = "Non-CORE"
REJECTED = "Rejected"

CLASSIFIER_MAPPING = {
    API_CORE: CORE,
    API_NON_CORE: NON_CORE,
    API_REJECTED: REJECTED,
}


def calculate_coreness(results):
    scores_raw = results["scores"]
    prediction = results["prediction"]

    max_score = scores_raw[prediction]
    decision = CLASSIFIER_MAPPING[prediction]

    scores = {
        CORE: scores_raw[API_CORE],
        NON_CORE: scores_raw[API_NON_CORE],
        REJECTED: scores_raw[API_REJECTED],
    }

    relevance_score = max_score
    if decision == CORE:
        relevance_score += 1
    elif decision == NON_CORE:
        relevance_score = 0.5 * scores[NON_CORE] + scores[CORE]
    elif decision == REJECTED:
        relevance_score *= -1

    return {
        "max_score": max_score,
        "decision": decision,
        "scores": scores,
        "relevance_score": relevance_score,
    }
