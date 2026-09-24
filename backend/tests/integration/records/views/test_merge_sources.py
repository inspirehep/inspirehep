"""The normal literature PUT must commit merge metadata and roots together."""

from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
from datetime import datetime
from threading import Event, current_thread
from time import monotonic, sleep
from unittest.mock import patch

import pytest
from helpers.cleanups import db_cleanup
from helpers.utils import create_user_and_token
from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.records.models import WorkflowsRecordSources
from inspirehep.records.utils import get_ref_from_pid
from invenio_db import db
from sqlalchemy import event, text
from sqlalchemy.engine import Engine


@pytest.fixture
def db_(database):
    # These tests need real commits and separate connections, not a shared savepoint.
    try:
        yield database
    finally:
        db_cleanup(database)


@pytest.fixture
def merge_case(inspire_app):
    token = create_user_and_token()
    records = []
    for _ in range(2):
        record = LiteratureRecord.create(
            {
                "$schema": "http://localhost:5000/schemas/records/hep.json",
                "titles": [{"title": "Original title"}],
                "_collections": ["Literature"],
                "document_type": ["article"],
                "acquisition_source": {"source": "arxiv", "method": "hepcrawl"},
            }
        )
        db.session.commit()
        records.append(
            {
                "uuid": str(record.id),
                "number": record.control_number,
                "revision": record.revision_id,
                "data": deepcopy(dict(record)),
            }
        )
    head, update = records
    for owner, source, day in (
        (head, "arxiv", 1),
        (update, "arxiv", 2),
        (update, "publisher", 3),
        (head, "submitter", 4),
    ):
        db.session.add(
            WorkflowsRecordSources(
                record_uuid=owner["uuid"],
                source=source,
                json={"title": f"{source}-{day}"},
                created=datetime(2026, 1, day),
                updated=datetime(2026, 1, day),
            )
        )
    db.session.commit()
    data = deepcopy(head["data"])
    data["titles"] = [{"title": "Curator approved title"}]
    data["deleted_records"] = [get_ref_from_pid("lit", update["number"])]
    return {
        "url": f'/api/literature/{head["number"]}',
        "headers": {
            "Authorization": "BEARER " + token.access_token,
            "Accept": "application/vnd+inspire.record.raw+json",
            "If-Match": f'"{head["revision"]}"',
        },
        "data": data,
        "head": head,
        "update": update,
    }


def snapshot(case):
    db.session.expire_all()
    records = [
        LiteratureRecord.get_record(case[key]["uuid"], with_deleted=True)
        for key in ("head", "update")
    ]
    return (
        [(deepcopy(dict(record)), record.revision_id) for record in records],
        sorted(
            (str(root.record_uuid), root.source, deepcopy(root.json), root.updated)
            for root in WorkflowsRecordSources.query.all()
        ),
    )


def put(client, case, data=None, headers=None):
    return client.put(
        case["url"],
        json=data if data is not None else case["data"],
        headers=headers or case["headers"],
    )


def test_merge_put_transfers_sources(inspire_app, merge_case):
    with inspire_app.test_client() as client:
        response = put(client, merge_case)
    assert response.status_code == 200, response.json
    records, roots = snapshot(merge_case)
    assert records[0][0]["titles"] == [{"title": "Curator approved title"}]
    assert records[1][0]["deleted"] is True
    assert [(owner, source, data) for owner, source, data, _ in roots] == [
        (merge_case["head"]["uuid"], source, {"title": f"{source}-{day}"})
        for source, day in (("arxiv", 2), ("publisher", 3), ("submitter", 4))
    ]
    assert roots[0][3] > datetime(2026, 1, 4)
    assert roots[1][3] > datetime(2026, 1, 4)
    assert roots[2][3] == datetime(2026, 1, 4)
    with inspire_app.test_client() as client:
        assert (
            client.get(f'/api/literature/{merge_case["update"]["number"]}').status_code
            == 301
        )


@pytest.mark.parametrize("head_day", [2, 5])
def test_merge_keeps_head_source_on_tie_or_newer(inspire_app, merge_case, head_day):
    # Core UPDATE deliberately preserves the supplied timestamp (ORM update timestamps now).
    db.session.execute(
        WorkflowsRecordSources.__table__.update()
        .where(WorkflowsRecordSources.record_uuid == merge_case["head"]["uuid"])
        .where(WorkflowsRecordSources.source == "arxiv")
        .values(updated=datetime(2026, 1, head_day))
    )
    db.session.commit()
    with inspire_app.test_client() as client:
        assert put(client, merge_case).status_code == 200
    _, roots = snapshot(merge_case)
    assert len(roots) == 3
    assert roots[0][2] == {"title": "arxiv-1"}
    assert roots[0][3] == datetime(2026, 1, head_day)


@pytest.mark.parametrize("failure", ["stale", "invalid"])
def test_rejected_merge_preserves_records_and_sources(inspire_app, merge_case, failure):
    before = snapshot(merge_case)
    data = deepcopy(merge_case["data"])
    headers = dict(merge_case["headers"])
    if failure == "stale":
        headers["If-Match"] = '"999"'
    else:
        data["titles"] = "invalid"
    with inspire_app.test_client() as client:
        response = put(client, merge_case, data, headers)
    assert response.status_code == (412 if failure == "stale" else 400)
    assert snapshot(merge_case) == before


def test_merge_rolls_back_sources_on_late_failure(inspire_app, merge_case):
    before = snapshot(merge_case)
    original = LiteratureRecord.update_record_relationships
    injected = []

    def fail_after_relationships(record):
        original(record)
        if str(record.id) == merge_case["head"]["uuid"]:
            db.session.flush()
            roots = WorkflowsRecordSources.query.filter_by(record_uuid=record.id).all()
            assert len(roots) == 3
            injected.append(True)
            raise RuntimeError("Injected failure before commit")

    with (
        patch.object(
            LiteratureRecord, "update_record_relationships", fail_after_relationships
        ),
        inspire_app.test_client() as client,
    ):
        assert put(client, merge_case).status_code == 500
    assert injected == [True]
    assert snapshot(merge_case) == before


def test_retry_after_commit_is_stale_but_sources_are_already_consistent(
    inspire_app, merge_case
):
    with inspire_app.test_client() as client:
        assert put(client, merge_case).status_code == 200
        committed = snapshot(merge_case)
        # A caller that lost the successful response still holds the old ETag.
        assert put(client, merge_case).status_code == 412
    assert snapshot(merge_case) == committed
    assert {root[0] for root in committed[1]} == {merge_case["head"]["uuid"]}


def test_source_writer_cannot_recreate_roots_on_merged_record(inspire_app, merge_case):
    with inspire_app.test_client() as client:
        assert put(client, merge_case).status_code == 200
        response = client.post(
            "/api/literature/workflows_record_sources",
            json={
                "record_uuid": merge_case["update"]["uuid"],
                "source": "arxiv",
                "json": {"title": "late writer"},
            },
            headers=merge_case["headers"],
        )
    assert response.status_code == 409
    assert {root[0] for root in snapshot(merge_case)[1]} == {merge_case["head"]["uuid"]}


def test_source_writer_waits_for_merge_commit(inspire_app, merge_case):
    engine = db.engine
    writer_started = Event()
    writer_pid = []
    writer = []
    original = LiteratureRecord.update_record_relationships

    def capture_writer(conn, cursor, statement, parameters, context, executemany):
        if (
            current_thread().name.startswith("source-writer")
            and not writer_started.is_set()
        ):
            cursor.execute("SET LOCAL statement_timeout = '10s'")
            writer_pid.append(conn.connection.connection.get_backend_pid())
            writer_started.set()

    def write_source():
        with inspire_app.test_client() as client:
            return client.post(
                "/api/literature/workflows_record_sources",
                json={
                    "record_uuid": merge_case["update"]["uuid"],
                    "source": "submitter",
                    "json": {"title": "concurrent source"},
                },
                headers=merge_case["headers"],
            )

    def write_before_commit(record):
        original(record)
        if str(record.id) != merge_case["head"]["uuid"]:
            return
        db.session.flush()
        writer.append(pool.submit(write_source))
        assert writer_started.wait(10), "Source writer did not start"
        deadline = monotonic() + 10
        # Release the merge only once PostgreSQL blocks the writer or it finishes.
        with engine.connect() as connection:
            while not writer[0].done():
                blocked = connection.execute(
                    text("SELECT cardinality(pg_blocking_pids(:pid)) > 0"),
                    {"pid": writer_pid[0]},
                ).scalar()
                if blocked:
                    break
                assert monotonic() < deadline, "Source writer did not reach the merge"
                sleep(0.01)

    event.listen(Engine, "before_cursor_execute", capture_writer)
    try:
        with ThreadPoolExecutor(
            max_workers=1, thread_name_prefix="source-writer"
        ) as pool:
            with (
                patch.object(
                    LiteratureRecord, "update_record_relationships", write_before_commit
                ),
                inspire_app.test_client() as client,
            ):
                response = put(client, merge_case)
                assert response.status_code == 200, response.json
            response = writer[0].result(timeout=10)
            assert response.status_code == 409, (response.status, response.json)
    finally:
        event.remove(Engine, "before_cursor_execute", capture_writer)
    assert {root[0] for root in snapshot(merge_case)[1]} == {merge_case["head"]["uuid"]}


def test_ordinary_edit_and_delete_do_not_move_sources(inspire_app, merge_case):
    _, before = snapshot(merge_case)
    with inspire_app.test_client() as client:
        data = deepcopy(merge_case["head"]["data"])
        data["titles"] = [{"title": "Ordinary edit"}]
        assert put(client, merge_case, data).status_code == 200
    assert snapshot(merge_case)[1] == before
    record = LiteratureRecord.get_record(merge_case["head"]["uuid"])
    record.delete()
    db.session.commit()
    assert snapshot(merge_case)[1] == before


def test_create_with_deleted_records_still_works(inspire_app, merge_case):
    # create redirects before assigning its model; the new PUT hook must not
    # require the destination model to exist along that separate lifecycle.
    data = deepcopy(merge_case["data"])
    data.pop("control_number")
    data.pop("self", None)
    with inspire_app.test_client() as client:
        response = client.post(
            "/api/literature", json=data, headers=merge_case["headers"]
        )
    assert response.status_code == 201, response.json
    assert LiteratureRecord.get_record(merge_case["update"]["uuid"], with_deleted=True)[
        "deleted"
    ]


def test_second_merge_preserves_existing_timestamp_precedence(inspire_app, merge_case):
    data = deepcopy(merge_case["head"]["data"])
    data.pop("control_number")
    data.pop("self", None)
    third = LiteratureRecord.create(data)
    db.session.commit()
    third_uuid = str(third.id)
    third_url = f"/api/literature/{third.control_number}"
    third_headers = {**merge_case["headers"], "If-Match": f'"{third.revision_id}"'}
    data = deepcopy(dict(third))
    data["deleted_records"] = [get_ref_from_pid("lit", merge_case["head"]["number"])]
    db.session.add(
        WorkflowsRecordSources(
            record_uuid=third_uuid,
            source="arxiv",
            json={"title": "third source"},
            created=datetime(2026, 1, 5),
            updated=datetime(2026, 1, 5),
        )
    )
    db.session.commit()
    with inspire_app.test_client() as client:
        assert put(client, merge_case).status_code == 200
        assert (
            client.put(third_url, json=data, headers=third_headers).status_code == 200
        )
    roots = WorkflowsRecordSources.query.all()
    assert {str(root.record_uuid) for root in roots} == {third_uuid}
    assert next(root.json for root in roots if root.source == "arxiv") == {
        "title": "arxiv-2"
    }
