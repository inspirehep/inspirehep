from urllib.parse import parse_qs, urlparse

from helpers.utils import create_record

from inspirehep.serializers import record_responsify, search_responsify


def parse_url(url):
    """Build a comparable dict from the given url.
    The resulting dict can be comparend even when url's query parameters
    are in a different order.
    """
    parsed = urlparse(url)
    return {
        "scheme": parsed.scheme,
        "netloc": parsed.netloc,
        "path": parsed.path,
        "qs": parse_qs(parsed.query),
    }


class TestSerializer(object):
    """Test serializer."""

    def serialize(self, pid, record, **kwargs):
        """Dummy method."""
        return "{0}:{1}".format(pid, record["titles"][0]["title"])

    def serialize_search(self, fetcher, result, **kwargs):
        """Dummy method."""
        return str(len(result))


def test_page_links(inspire_app):
    """Test Link HTTP header on multi-page searches."""
    create_record("lit", data={"titles": [{"title": "Solenoid"}]})
    create_record("lit", data={"titles": [{"title": "Solenoid"}]})
    with inspire_app.test_client() as client:
        # Limit records
        response = client.get(
            "/api/literature", query_string=dict(size=1, page=1, q="Solenoid")
        )
        response_json = response.json
        assert len(response_json["hits"]["hits"]) == 1

        data = response_json["links"]
        assert "self" in data
        assert "next" in data
        assert "prev" not in data

        # Assert next URL before calling it
        first_url = data["self"]
        next_url = data["next"]
        parsed_url = parse_url(next_url)
        assert parsed_url["qs"]["size"] == ["1"]
        assert parsed_url["qs"]["page"] == ["2"]

        # Access next URL
        response = client.get(next_url)
        response_json = response.json
        assert len(response_json["hits"]["hits"]) == 1
        data = response.json["links"]
        assert data["self"] == next_url
        assert "next" not in data
        assert "prev" in data and data["prev"] == first_url


def test_record_responsify(inspire_app):
    """Test JSON serialize."""
    rec_serializer = record_responsify(TestSerializer(), "application/x-custom")

    rec = create_record("lit", data={"titles": [{"title": "Solenoid"}]})
    resp = rec_serializer(1020, rec, headers=[("X-Test", "test")])
    assert resp.status_code == 200
    assert resp.content_type == "application/x-custom"
    assert resp.get_data(as_text=True) == "1020:Solenoid"
    assert resp.headers["X-Test"] == "test"
    assert not resp.headers.get("Link")

    resp = rec_serializer(1020, rec, code=201)
    assert resp.status_code == 201


def test_search_responsify(inspire_app):
    """Test JSON serialize."""
    search_serializer = search_responsify(TestSerializer(), "application/x-custom")

    def fetcher():
        pass

    result = ["a"] * 5

    resp = search_serializer(fetcher, result)
    assert resp.status_code == 200
    assert resp.content_type == "application/x-custom"
    assert resp.get_data(as_text=True) == "5"

    resp = search_serializer(fetcher, result, code=201, headers=[("X-Test", "test")])
    assert resp.status_code == 201
    assert resp.headers["X-Test"] == "test"
    assert not resp.headers.get("Link")


def test_record_responsify_attach_link_header_when_needed(inspire_app):
    """Test JSON serialize."""
    rec_serializer = record_responsify(TestSerializer(), "application/x-custom")

    rec = create_record("lit", data={"titles": [{"title": "Solenoid"}]})
    resp = rec_serializer(
        1020, rec, headers=[("X-Test", "test")], links_factory=lambda x: {"test": x}
    )
    assert resp.status_code == 200
    assert resp.content_type == "application/x-custom"
    assert resp.get_data(as_text=True) == "1020:Solenoid"
    assert resp.headers["X-Test"] == "test"
    assert resp.headers.get("Link")

    resp = rec_serializer(1020, rec, code=201)
    assert resp.status_code == 201


def test_search_responsify_attach_link_header_when_needed(inspire_app):
    """Test JSON serialize."""
    search_serializer = search_responsify(TestSerializer(), "application/x-custom")

    def fetcher():
        pass

    result = ["a"] * 5

    resp = search_serializer(fetcher, result)
    assert resp.status_code == 200
    assert resp.content_type == "application/x-custom"
    assert resp.get_data(as_text=True) == "5"

    resp = search_serializer(
        fetcher,
        result,
        code=201,
        headers=[("X-Test", "test")],
        links={"test": "a test"},
    )
    assert resp.status_code == 201
    assert resp.headers["X-Test"] == "test"
    assert resp.headers.get("Link")
