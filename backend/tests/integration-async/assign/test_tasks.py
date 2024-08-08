from helpers.utils import create_record, retry_test
from inspirehep.assign.tasks import assign_papers
from inspirehep.records.api import AuthorsRecord
from inspirehep.search.api import LiteratureSearch
from invenio_db import db
from invenio_search import current_search
from tenacity import stop_after_delay, wait_fixed


def test_assign_from_an_author_to_another(inspire_app, clean_celery_session):
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
    }
    from_author = create_record("aut")
    to_author = create_record("aut", data=author_data)
    literature_1 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Urhan, Harun",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                },
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": "http://localhost:5000/api/authors/17200"},
                },
            ]
        },
    )
    literature_2 = create_record(
        "lit",
        data={
            "authors": [
                {
                    "curated_relation": False,
                    "full_name": "Urhan, Harun",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                }
            ]
        },
    )
    db.session.commit()

    assign_papers.delay(
        from_author_recid=from_author["control_number"],
        to_author_record=to_author,
        author_papers_recids=[
            literature_1["control_number"],
            literature_2["control_number"],
        ],
    )

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_assign():
        for literature in [literature_1, literature_2]:
            current_search.flush_and_refresh("*")
            literature_after = LiteratureSearch.get_record_data_from_es(literature)
            literature_author = literature_after["authors"][0]
            assert literature_author["record"] == {
                "$ref": f"http://localhost:5000/api/authors/{to_author['control_number']}"
            }
            assert literature_author["curated_relation"]

    assert_assign()


def test_assign_from_an_author_to_another_that_is_not_stub(
    inspire_app, clean_celery_session
):
    author_data = {
        "name": {"value": "Aad, Georges", "preferred_name": "Georges Aad"},
        "ids": [{"value": "G.Aad.1", "schema": "INSPIRE BAI"}],
        "stub": False,
    }
    from_author = create_record("aut")
    to_author = create_record("aut", data=author_data)
    literature = create_record(
        "lit",
        data={
            "authors": [
                {
                    "full_name": "Urhan, Ahmet",
                    "record": {"$ref": "http://localhost:5000/api/authors/17200"},
                },
                {
                    "full_name": "Urhan, Harun",
                    "record": {
                        "$ref": f"http://localhost:5000/api/authors/{from_author['control_number']}"
                    },
                },
            ]
        },
    )
    db.session.commit()

    assign_papers.delay(
        from_author_recid=from_author["control_number"],
        to_author_record=to_author,
        author_papers_recids=[literature["control_number"]],
    )

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_assign():
        current_search.flush_and_refresh("*")
        literature_after = LiteratureSearch.get_record_data_from_es(literature)
        literature_author = literature_after["authors"][1]
        to_author_after = AuthorsRecord.get_record_by_pid_value(
            to_author["control_number"]
        )
        assert literature_author["record"] == {
            "$ref": f"http://localhost:5000/api/authors/{to_author['control_number']}"
        }
        assert literature_author["curated_relation"]
        assert not to_author_after["stub"]

    assert_assign()
