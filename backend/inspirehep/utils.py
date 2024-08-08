#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import hashlib
import resource
import signal
from contextlib import contextmanager
from functools import partial
from math import ceil

import structlog
from flask import current_app
from flask_celeryext.app import current_celery_app
from redis import StrictRedis
from redis_lock import Lock

LOGGER = structlog.getLogger()


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
