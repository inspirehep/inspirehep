from include.inspire.guess_coreness import (
    API_CORE,
    API_NON_CORE,
    API_REJECTED,
    CORE,
    NON_CORE,
    REJECTED,
    calculate_coreness,
)


def test_prediction_core():
    results = {
        "scores": {
            API_CORE: 0.8,
            API_NON_CORE: 0.1,
            API_REJECTED: 0.05,
        },
        "prediction": API_CORE,
    }

    output = calculate_coreness(results)
    assert output["decision"] == CORE
    assert output["max_score"] == 0.8
    assert output["scores"] == {
        CORE: 0.8,
        NON_CORE: 0.1,
        REJECTED: 0.05,
    }
    assert output["relevance_score"] == 1.8


def test_prediction_non_core():
    results = {
        "scores": {
            API_CORE: 0.3,
            API_NON_CORE: 0.6,
            API_REJECTED: 0.1,
        },
        "prediction": API_NON_CORE,
    }

    output = calculate_coreness(results)
    assert output["decision"] == NON_CORE
    assert output["max_score"] == 0.6
    assert output["scores"] == {
        CORE: 0.3,
        NON_CORE: 0.6,
        REJECTED: 0.1,
    }
    expected_relevance = 0.5 * 0.6 + 0.3
    assert output["relevance_score"] == expected_relevance


def test_prediction_rejected():
    results = {
        "scores": {
            API_CORE: 0.2,
            API_NON_CORE: 0.3,
            API_REJECTED: 0.9,
        },
        "prediction": API_REJECTED,
    }

    output = calculate_coreness(results)
    assert output["decision"] == REJECTED
    assert output["max_score"] == 0.9
    assert output["scores"] == {
        CORE: 0.2,
        NON_CORE: 0.3,
        REJECTED: 0.9,
    }
    assert output["relevance_score"] == -0.9
