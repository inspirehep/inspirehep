import logging

logger = logging.getLogger(__name__)


def get_ticket_by_type(workflow, ticket_type):
    for ticket in workflow["tickets"]:
        if ticket["ticket_type"] == ticket_type:
            return ticket
