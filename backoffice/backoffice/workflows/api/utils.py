from backoffice.workflows.api.serializers import DecisionSerializer


def add_decision(workflow_id, user, action):
    serializer_class = DecisionSerializer
    data = {"workflow": workflow_id, "user": user, "action": action}

    serializer = serializer_class(data=data)
    if serializer.is_valid(raise_exception=True):
        serializer.save()
        return serializer.data
