from airflow.sdk import dag, task


@dag
def helper_dag():
    @task
    def vessel_task(*args, **context):
        pass

    vessel_task(None)


helper_dag()
