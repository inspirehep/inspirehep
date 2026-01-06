import contextlib

import pytest
from hooks.backoffice.workflow_ticket_management_hook import (
    AuthorWorkflowTicketManagementHook,
)

from tests.test_utils import function_test


class TestWorkflowTicketManagementHook:
    workflow_ticket_management_hook = AuthorWorkflowTicketManagementHook()
    test_workflow_id = "00000000-0000-0000-0000-000000001521"

    @pytest.mark.vcr
    def test_create_ticket_entry(self):
        with contextlib.suppress(TypeError):
            function_test(
                self.workflow_ticket_management_hook.create_ticket_entry,
                params={
                    "workflow_id": self.test_workflow_id,
                    "ticket_id": 123,
                    "ticket_type": "author_create_user",
                },
            )
