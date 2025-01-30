import urllib.parse

import orjson
from helpers.providers.faker import faker
from helpers.utils import create_record_async, retry_test
from inspirehep.records.api.literature import LiteratureRecord
from invenio_db import db
from tenacity import stop_after_delay, wait_fixed


def test_data_facets_author_updated_literature(inspire_app, clean_celery_session):
    author1 = create_record_async("aut", faker.record("aut"))
    author2 = create_record_async("aut", faker.record("aut"))

    authors1 = [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author1['control_number']}"
            },
            "full_name": author1["name"]["value"],
        }
    ]
    authors_updated = authors1 + [
        {
            "record": {
                "$ref": f"http://localhost:8000/api/authors/{author2['control_number']}"
            },
            "full_name": author2["name"]["value"],
        }
    ]

    literature = create_record_async("lit", data={"authors": authors1})
    create_record_async("dat", data={"literature": [{"record": literature["self"]}]})

    @retry_test(stop=stop_after_delay(5), wait=wait_fixed(2))
    def test_initial_authors():
        with inspire_app.test_client() as client:
            response1 = client.get(
                f"/api/data?author={author1['control_number']}_{urllib.parse.quote(author1['name']['value'])}",
                headers={"Accept": "application/vnd+inspire.record.ui+json"},
            )
            response2 = client.get(
                f"/api/data?author={author2['control_number']}_{urllib.parse.quote(author2['name']['value'])}",
                headers={"Accept": "application/vnd+inspire.record.ui+json"},
            )
        response_data1 = orjson.loads(response1.data)
        response_data2 = orjson.loads(response2.data)
        assert response_data1["hits"]["total"] == 1
        assert (
            response_data1["hits"]["hits"][0]["metadata"]["authors"][0]["full_name"]
            == author1["name"]["value"]
        )
        assert response_data2["hits"]["total"] == 0

    test_initial_authors()

    literature_record = LiteratureRecord.get_record_by_pid_value(
        literature.control_number
    )
    literature["authors"] = authors_updated
    literature_record.update(dict(literature))
    db.session.commit()

    @retry_test(stop=stop_after_delay(5), wait=wait_fixed(2))
    def test_updated_authors():
        with inspire_app.test_client() as client:
            response1 = client.get(
                f"/api/data?author={author1['control_number']}_{urllib.parse.quote(author1['name']['value'])}",
                headers={"Accept": "application/vnd+inspire.record.ui+json"},
            )
            response2 = client.get(
                f"/api/data?author={author2['control_number']}_{urllib.parse.quote(author2['name']['value'])}",
                headers={"Accept": "application/vnd+inspire.record.ui+json"},
            )
        response_data1 = orjson.loads(response1.data)
        response_data2 = orjson.loads(response2.data)
        assert response_data1["hits"]["total"] == 1
        assert (
            response_data1["hits"]["hits"][0]["metadata"]["authors"][0]["full_name"]
            == author1["name"]["value"]
        )
        assert response_data2["hits"]["total"] == 1
        assert (
            response_data2["hits"]["hits"][0]["metadata"]["authors"][1]["full_name"]
            == author2["name"]["value"]
        )

    test_updated_authors()
