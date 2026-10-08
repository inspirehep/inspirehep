from unittest.mock import patch

from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)


@patch.object(InspireHTTPRecordManagementHook, "run_with_advanced_retry")
def test_patch_record_uses_json_patch(mock_run):
    hook = InspireHTTPRecordManagementHook()
    patch_data = [
        {
            "op": "add",
            "path": "/external_system_identifiers",
            "value": [{"schema": "CDS", "value": "2056247"}],
        }
    ]

    hook.patch_record(
        data=patch_data,
        pid_type="literature",
        control_number=123,
        revision_id=3,
    )

    mock_run.assert_called_once()
    call_kwargs = mock_run.call_args.kwargs
    call_kwargs.pop("_retry_args")
    assert call_kwargs == {
        "method": "PATCH",
        "headers": {
            "Content-Type": "application/json-patch+json",
            "If-Match": '"2"',
        },
        "json": patch_data,
        "endpoint": "/api/literature/123",
    }
