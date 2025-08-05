def get_decision(decisions, action):
    for decision in decisions:
        if decision["action"] == action:
            return decision
    return None
