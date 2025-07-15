import logging

from rest_framework import status, viewsets
from rest_framework.response import Response

from backoffice.hep.utils import add_hep_decision
from backoffice.hep.api.serializers import (
    HepWorkflowTicketSerializer,
    HepDecisionSerializer,
)
from backoffice.common.views import BaseWorkflowTicketViewSet
from backoffice.hep.models import HepWorkflowTicket, HepDecision

logger = logging.getLogger(__name__)


class HepWorkflowTicketViewSet(BaseWorkflowTicketViewSet):
    serializer_class = HepWorkflowTicketSerializer
    queryset = HepWorkflowTicket.objects.all()


class HepDecisionViewSet(viewsets.ModelViewSet):
    serializer_class = HepDecisionSerializer
    queryset = HepDecision.objects.all()

    def create(self, request, *args, **kwargs):
        data = add_hep_decision(
            request.data["workflow_id"], request.user, request.data["action"]
        )
        return Response(data, status=status.HTTP_201_CREATED)
