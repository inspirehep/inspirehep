from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from requests import Response


class InspireHTTPRecordManagementHook(InspireHttpHook):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def update_record(
        self, data: dict, pid_type: str, control_number: int, revision_id: str
    ) -> Response:
        update_headers = {**self.headers, "If-Match": f'"{revision_id - 1}"'}
        return self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            method="PUT",
            headers=update_headers,
            json=data,
            endpoint=f"/api/{pid_type}/{control_number}",
        )

    def get_record(self, pid_type: str, control_number: int) -> Response:
        response = self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            method="GET",
            headers=self.headers,
            endpoint=f"/api/{pid_type}/{control_number}",
        )
        return response.json()

    def get_record_revision_id(self, pid_type: str, control_number: int) -> int:
        response = self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            method="GET",
            headers=self.headers,
            endpoint=f"/api/{pid_type}/{control_number}",
        )
        response.raise_for_status()
        return response.json()["revision_id"]

    def post_record(self, data: dict, pid_type: str) -> Response:
        return self.run_with_advanced_retry(
            _retry_args=self.tenacity_retry_kwargs,
            method="POST",
            headers=self.headers,
            json=data,
            endpoint=f"api/{pid_type}",
        )
