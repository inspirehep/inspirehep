import pytest
from hooks.backoffice.workflow_ticket_management_hook import (
    AuthorWorkflowTicketManagementHook,
)


class TestWorkflowTicketManagementHook:
    workflow_ticket_management_hook = AuthorWorkflowTicketManagementHook()
    test_workflow_id = "00000000-0000-0000-0000-000000001521"

    @pytest.mark.vcr
    def test_create_ticket_entry(self):
        self.workflow_ticket_management_hook.create_ticket_entry(
            workflow_id=self.test_workflow_id,
            ticket_type="author_create_user",
            ticket_id=123,
        )
