import contextlib

import pytest
from hooks.backoffice.workflow_ticket_management_hook import (
    AuthorWorkflowTicketManagementHook,
)


@pytest.mark.usefixtures("hep_env")
class TestWorkflowTicketManagementHook:
    workflow_ticket_management_hook = AuthorWorkflowTicketManagementHook()
    test_workflow_id = "00000000-0000-0000-0000-000000001521"

    @pytest.mark.vcr
    def test_create_ticket_entry(self):
        with contextlib.suppress(TypeError):
            self.workflow_ticket_management_hook.create_ticket_entry(
                self.test_workflow_id,
                123,
                "author_create_user",
            )
