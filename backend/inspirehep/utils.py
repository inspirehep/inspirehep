# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import hashlib
from contextlib import contextmanager
from math import ceil

from flask import current_app
from redis import StrictRedis
from redis_lock import Lock


def include_table_check(object, name, type_, *args, **kwargs):
    if type_ == "table" and name in current_app.config.get("ALEMBIC_SKIP_TABLES"):
        return False
    return True


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
    if isinstance(input_list, (list, tuple)):
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
