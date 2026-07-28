from include.inspire.approval import (
    has_fully_harvested_category,
    physics_data_an_is_primary_category,
)


def test_has_fully_harvested_category_ignores_eprints_without_categories():
    record = {
        "arxiv_eprints": [
            {"value": "2501.00001"},
            {"value": "2501.00002", "categories": ["hep-th"]},
        ]
    }

    assert has_fully_harvested_category(record)


def test_physics_data_an_is_primary_category_ignores_eprints_without_categories():
    record = {"arxiv_eprints": [{"value": "2501.00001"}]}

    assert physics_data_an_is_primary_category(record) is False
