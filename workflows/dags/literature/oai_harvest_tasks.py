from airflow.sdk import task


@task
def get_sets(**context):
    """
    Returns: list of sets
    """
    return context["params"]["sets"]
