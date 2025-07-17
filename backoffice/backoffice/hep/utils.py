from backoffice.hep.api.serializers import HepDecisionSerializer


def add_hep_decision(workflow_id, user, action):
    data = {"workflow": workflow_id, "user": user, "action": action}

    serializer = HepDecisionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data
