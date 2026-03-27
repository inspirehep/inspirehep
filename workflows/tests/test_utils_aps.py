from unittest.mock import Mock

from include.utils.aps import build_articles_params, extract_next_params


class TestAPSUtils:
    def test_build_articles_params(self):
        params = build_articles_params(
            set_name="openaccess",
            from_date="2016-05-01",
            until_date="2016-05-15",
            per_page=100,
            date="published",
        )

        assert params == {
            "set": "openaccess",
            "from": "2016-05-01",
            "until": "2016-05-15",
            "per_page": 100,
            "date": "published",
        }

    def test_extract_next_params(self):
        response = Mock()
        response.headers = {
            "Link": (
                "<http://harvest.aps.org/v2/journals/articles"
                '?set=openaccess&page=2>; rel="next"'
            )
        }

        assert extract_next_params(response) == {
            "set": "openaccess",
            "page": "2",
        }
