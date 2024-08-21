import pytest
from dags.author.author_create.shared_tasks import (
    close_author_create_user_ticket,
)


class TestAuthorCreate:
    context = {
        "params": {
            "workflow_id": "f8301c06-8fa1-4124-845e-c270b910af5f",
            "data": {"value": "reject", "create_ticket": False},
        }
    }

    @pytest.mark.vcr()
    def test_close_author_create_user_ticket(self):
        close_author_create_user_ticket.function(**self.context)
