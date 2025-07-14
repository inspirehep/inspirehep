from backoffice.authors.api.serializers import AuthorDecisionSerializer


def add_author_decision(workflow_id, user, action):
    data = {"workflow": workflow_id, "user": user, "action": action}

    serializer = AuthorDecisionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return serializer.data
