import tenacity


def tenacity_retry_kwargs():
    return {
        "wait": tenacity.wait_exponential(),
        "stop": tenacity.stop_after_attempt(5),
        "retry": tenacity.retry_if_exception_type(Exception),
    }
