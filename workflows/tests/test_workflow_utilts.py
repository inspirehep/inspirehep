import pytest
from include.utils import workflows


@pytest.mark.parametrize(
    ("source", "expected_source"),
    [
        ("publisher", "publisher"),
        ("desy", "publisher"),
        ("jessica jones", "publisher"),
        ("arxiv", "arxiv"),
        ("submitter", "submitter"),
    ],
)
def test_get_source_root(source, expected_source):
    result = workflows.get_source_for_root(source)

    assert expected_source == result
