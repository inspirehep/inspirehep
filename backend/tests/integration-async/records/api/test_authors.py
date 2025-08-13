from helpers.providers.faker import faker
from inspirehep.records.api.authors import AuthorsRecord
from invenio_db import db


def test_get_linked_advisors_when_name_changes(inspire_app):
    data_advisor = faker.record("aut")
    advisor = AuthorsRecord.create(data_advisor)
    db.session.commit()

    assert not advisor.get_linked_advisors_when_name_changes()

    student_data = faker.record(
        "aut",
        data={
            "advisors": [
                {
                    "name": advisor["name"]["value"],
                    "record": advisor["self"],
                    "degree_type": "phd",
                }
            ]
        },
    )
    student = AuthorsRecord.create(student_data)
    db.session.commit()

    assert student.get_linked_advisors_when_name_changes() == set([str(advisor.id)])

    student["ids"] = [{"value": "0000-0002-1558-1309", "schema": "ORCID"}]
    student.update(dict(student))
    db.session.commit()

    assert not student.get_linked_advisors_when_name_changes()

    student["name"]["preferred_name"] = "Test Author"
    student.update(dict(student))
    db.session.commit()
    assert student.get_linked_advisors_when_name_changes() == set([str(advisor.id)])

    del student["name"]["preferred_name"]
    student.update(dict(student))
    db.session.commit()
    assert student.get_linked_advisors_when_name_changes() == set([str(advisor.id)])


def test_student_with_the_same_advisor_for_multiple_degrees(inspire_app):
    data_advisor = faker.record("aut")
    advisor = AuthorsRecord.create(data_advisor)
    db.session.commit()

    assert not advisor.get_linked_advisors_when_name_changes()

    student_data = faker.record(
        "aut",
        data={
            "advisors": [
                {
                    "name": advisor["name"]["value"],
                    "record": advisor["self"],
                    "degree_type": "master",
                },
                {
                    "name": advisor["name"]["value"],
                    "record": advisor["self"],
                    "degree_type": "phd",
                },
            ]
        },
    )
    AuthorsRecord.create(student_data)
    db.session.commit()
