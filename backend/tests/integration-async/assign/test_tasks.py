from helpers.utils import create_record, retry_until_pass
from invenio_db import db

from inspirehep.assign.tasks import assign_papers
from inspirehep.records.api import AuthorsRecord, LiteratureRecord


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

    assign_papers(
        from_author_recid=from_author["control_number"],
        to_author_record=to_author,
        author_papers=[literature_1, literature_2],
    )

    def assert_assign():
        for literature in [literature_1, literature_2]:
            literature_after = LiteratureRecord.get_record_by_pid_value(
                literature["control_number"]
            )
            literature_author = literature_after["authors"][0]
            assert literature_author["record"] == {
                "$ref": f"http://localhost:5000/api/authors/{to_author['control_number']}"
            }
            assert literature_author["curated_relation"]
            assert literature_author["ids"] == to_author["ids"]

    retry_until_pass(assert_assign, retry_interval=5)


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

    assign_papers(
        from_author_recid=from_author["control_number"],
        to_author_record=to_author,
        author_papers=[literature],
    )

    def assert_assign():
        literature_after = LiteratureRecord.get_record_by_pid_value(
            literature["control_number"]
        )
        literature_author = literature_after["authors"][1]
        to_author_after = AuthorsRecord.get_record_by_pid_value(
            to_author["control_number"]
        )
        assert literature_author["record"] == {
            "$ref": f"http://localhost:5000/api/authors/{to_author['control_number']}"
        }
        assert literature_author["curated_relation"]
        assert literature_author["ids"] == to_author["ids"]
        assert not to_author_after["stub"]

    retry_until_pass(assert_assign, retry_interval=5)
