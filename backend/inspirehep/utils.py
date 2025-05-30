#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import hashlib
import os
import resource
import signal
from contextlib import contextmanager
from functools import partial
from math import ceil

import structlog
import zulip
from flask import current_app
from flask_celeryext.app import current_celery_app
from redis import StrictRedis
from redis_lock import Lock
from werkzeug.utils import import_string

LOGGER = structlog.getLogger()

MAX_CHARACTERS_IN_ZULIP_MESSAGE = 200


def send_zulip_notification(message: str):
    zulip_api_key = os.environ.get("ZULIP_NOTIFICATION_API_KEY")
    zulip_notification_email = os.environ.get("ZULIP_NOTIFICATION_EMAIL")
    zulip_notification_site = os.environ.get("ZULIP_NOTIFICATION_SITE")
    if not all([zulip_api_key, zulip_notification_email, zulip_notification_site]):
        return

    zulip_client = zulip.Client(
        api_key=zulip_api_key,
        email=zulip_notification_email,
        site=zulip_notification_site,
    )

    result = zulip_client.send_message(
        {
            "type": "stream",
            "to": os.environ.get("ZULIP_NOTIFICATION_CHANNEL"),
            "topic": os.environ.get("ZULIP_NOTIFICATION_TOPIC"),
            "content": message,
        }
    )
    if result.get("result") != "success":
        LOGGER.error("Failed to send Zulip message", message=result)


def make_error_message(exception):
    """
    If the exception text is longer than `threshold` chars, wrap it
    in a spoiler block; otherwise just return it.
    """
    if len(exception) > MAX_CHARACTERS_IN_ZULIP_MESSAGE:
        return f"```spoiler Error Message\n\n{exception}\n\n```\n\n"
    return f"**Error message**: {exception}\n\n"


def format_failure_message_for_multiple(task_name, exception, affected_records):
    """Return a formatted failure message based on the number of affected records."""
    affected_records_list = "\n".join(f"- {record}" for record in affected_records)
    error_message_section = make_error_message(exception)
    return (
        f"**Task name**: `{task_name}`\n\n"
        f"{error_message_section}"
        f"**Affected record(s)**:\n {affected_records_list}"
    )


def format_failure_message_for_single(
    task_name, exception, affected_record, affected_orcid=None
):
    """Return a formatted failure message based on the affected record."""
    error_message_section = make_error_message(exception)
    failure_message = (
        f"**Task name**: `{task_name}`\n\n"
        f"{error_message_section}"
        f"**Affected record**: {affected_record}"
    )
    if affected_orcid:
        failure_message += f"\n\n **Affected ORCID**: {affected_orcid}"

    return failure_message


def format_failure_message_for_no_records(task_name, exception):
    error_message_section = make_error_message(exception)
    return f"**Task name**: `{task_name}`\n\n" f"{error_message_section}"


def get_failure_message_for_batch_index(task_name, exception, **kwargs):
    return format_failure_message_for_multiple(
        task_name, exception, kwargs.get("records_uuids", [])
    )


def get_failure_message_for_index_record(task_name, exception, **kwargs):
    return format_failure_message_for_single(task_name, exception, kwargs.get("uuid"))


def get_failure_message_for_disambiguate_records(
    task_name, exception, uuid=None, record_version_id=None, **kwargs
):
    if isinstance(uuid, list):
        if not record_version_id:
            return format_failure_message_for_multiple(task_name, exception, uuid)
        uuid = [
            f"{u} (version {rec_id})"
            for u, rec_id in zip(uuid, record_version_id, strict=False)
        ]
        return format_failure_message_for_multiple(task_name, exception, uuid)
    if record_version_id:
        uuid = f"{uuid} (version {record_version_id})"

    return format_failure_message_for_single(task_name, exception, uuid)


def get_failure_message_for_celery_starmap(task_name, exception, *args, **kwargs):
    if not kwargs.get("task"):
        return
    task_name = kwargs.get("task", {})["task"]
    items = kwargs.get("it", [])
    uuids = [arg[0] for arg in items]
    version_ids = [arg[1] for arg in items]

    return get_failure_message_by_task(
        task_name, exception, uuids, version_ids, *args, **kwargs
    )


def get_failure_message_for_orcid_push(task_name, exception, **kwargs):
    return format_failure_message_for_single(
        task_name, exception, kwargs.get("rec_id"), kwargs.get("orcid")
    )


def get_failure_message_for_match_references_by_uuids(task_name, exception, uuids=None):
    if uuids and isinstance(uuids, list):
        return format_failure_message_for_multiple(task_name, exception, uuids)
    return format_failure_message_for_no_records(task_name, exception)


def get_failure_message_for_redirect_references_to_merged_record(
    task_name, exception, uuid=None
):
    if uuid:
        return format_failure_message_for_single(task_name, exception, uuid)
    return format_failure_message_for_no_records(task_name, exception)


def get_failure_message_for_hal_push(
    task_name, exception, recid=None, record_version_id=None
):
    if not recid:
        return format_failure_message_for_no_records(task_name, exception)

    if record_version_id:
        recid = f"{recid} (version {record_version_id})"

    return format_failure_message_for_single(task_name, exception, recid)


def get_failure_message_by_task(task_name, exception, *args, **kwargs):
    """Return a failure message based on the task name."""
    func_path = current_app.config["FAILURE_MESSAGE_BY_TASK"].get(task_name)
    try:
        builder = import_string(func_path)
    except Exception as e:
        LOGGER.error(f"Failed to import task {e}")
        return None
    return builder(task_name, exception, *args, **kwargs)


def include_table_check(object, name, type_, *args, **kwargs):
    return not (
        type_ == "table" and name in current_app.config.get("ALEMBIC_SKIP_TABLES")
    )


def get_inspirehep_url():
    PROTOCOL = current_app.config["PREFERRED_URL_SCHEME"]
    SERVER = current_app.config["SERVER_NAME"]
    return f"{PROTOCOL}://{SERVER}"


def chunker(iterable, max_chunk_size, min_num_chunks=0):
    """Split iterable into iterator over chunks.

    Args:
        iterable (iterable): iterable to chunk.
        max_chunk_size (int): maximum number of elements in a chunk. When that
            number is reached in the current chunk, the chunk gets returned and a
            new chunk gets started.
        min_num_chunks (int): when set to a strictly positive int, try to
            create at least the provided number of chunks. When each chunk gets
            dispatched to a worker, it's useful to set this to the number of
            workers. Note that this only has effect for sized collections that
            have a ``__len__`` method, not generic iterators.
    Yields:
        object: chunk with at most ``max_chunk_size`` elements from the input iterable.
    """
    chunk_size = max_chunk_size
    if min_num_chunks > 1:
        try:
            computed_chunk_size = ceil(len(iterable) / min_num_chunks)
            chunk_size = min(max_chunk_size, computed_chunk_size)
        except TypeError:
            pass

    buf = []
    for elem in iterable:
        buf.append(elem)
        if len(buf) == chunk_size:
            yield buf
            buf = []
    if buf:
        yield buf


def flatten_list(input_list):
    if isinstance(input_list, list | tuple):
        return [
            element for innerList in input_list for element in flatten_list(innerList)
        ]
    return [input_list]


def hash_data(data):
    if data:
        return hashlib.md5(data).hexdigest()
    raise ValueError("Data for hashing cannot be empty")


@contextmanager
def distributed_lock(lock_name, expire=10, auto_renewal=True, blocking=False):
    """Context manager to acquire a lock visible by all processes.
    This lock is implemented through Redis in order to be globally visible.
    Args:
        lock_name (str): name of the lock to be acquired.
        expire (int): duration in seconds after which the lock is released if
            not renewed in the meantime.
        auto_renewal (bool): if ``True``, the lock is automatically renewed as long
            as the context manager is still active.
        blocking (bool): if ``True``, wait for the lock to be released. If ``False``,
            return immediately, raising :class:`DistributedLockError`.
    It is recommended to set ``expire`` to a small value and
    ``auto_renewal=True``, which ensures the lock gets released quickly in case
    the process is killed without limiting the time that can be spent holding
    the lock.
    Raises:
        DistributedLockError: when ``blocking`` is set to ``False`` and the lock is already acquired.
    """
    if not lock_name:
        raise ValueError("Lock name not specified.")

    redis_url = current_app.config.get("CACHE_REDIS_URL")

    redis = StrictRedis.from_url(redis_url)
    lock = Lock(redis, lock_name, expire=expire, auto_renewal=auto_renewal)

    if lock.acquire(blocking=blocking):
        try:
            yield
        finally:
            lock.release()
    else:
        raise DistributedLockError("Cannot acquire lock for %s", lock_name)


class DistributedLockError(Exception):
    pass


def count_consumers_for_queue(queue_name):
    """Get the number of workers consuming messages from the given queue.
    Note:
        This is using the slow worker-to-worker API (~1s), so don't call it too
        often. We might need to improve it later.
    """
    try:
        queues_per_worker = (
            current_celery_app.control.inspect().active_queues().values()
        )
    except AttributeError:
        #  integration tests run in eager mode and have no queues
        return 0
    return sum(
        len([queue for queue in worker_queues if queue["name"] == queue_name])
        for worker_queues in queues_per_worker
    )


def next_batch(iterator, batch_size):
    """Get first batch_size elements from the iterable, or remaining if less.

    Args:
        iterator(Iterator): the iterator to batch.
        batch_size(int): the size of the batch.

    Returns:
        list: the next batch from the given iterator object.
    """
    batch = []

    try:
        for _idx in range(batch_size):
            batch.append(next(iterator))
    except StopIteration:
        pass

    return batch


def _exit_handler(record_uuids, task_name, signum, frame):
    memory_consumption = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    LOGGER.error(
        "Worker was killed",
        record_uuids=record_uuids,
        celery_task_name=task_name,
        memory_consumption=memory_consumption,
    )


def setup_celery_task_signals(record_ids, task_name):
    signal.signal(signal.SIGINT, partial(_exit_handler, record_ids, task_name))
    signal.signal(signal.SIGTERM, partial(_exit_handler, record_ids, task_name))
