from include.utils import workflows


def test_set_flag():
    workflow_data = {}
    workflows.set_flag("test_flag", True, workflow_data)
    assert workflow_data["flags"]["test_flag"] is True


def test_get_flag():
    workflow_data = {"flags": {"test_flag": True}}
    flag_value = workflows.get_flag("test_flag", workflow_data)
    assert flag_value is True
