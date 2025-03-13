#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging
import sys

import structlog
from celery import shared_task
from celery.signals import setup_logging, task_failure, task_postrun, task_prerun
from structlog_sentry import SentryJsonProcessor

from inspirehep.utils import send_zulip_notification

# Sentry
# ======
SENTRY_DSN = None
"""
The DSN tells the SDK where to send the events to.
"""

SENTRY_SEND_DEFAULT_PII = False
"""
If this flag is enabled, certain personally identifiable information is added by active integrations.
Without this flag they are never added to the event, to begin with.
"""

# Prometheus
# ==========
PROMETHEUS_ENABLE_EXPORTER_FLASK = False
"""
Enable Flask metrics, using https://github.com/rycus86/prometheus_flask_exporter
"""

# Structlog
# =========
shared_processors = [
    structlog.threadlocal.merge_threadlocal_context,
    structlog.stdlib.add_logger_name,
    structlog.stdlib.add_log_level,
    structlog.stdlib.PositionalArgumentsFormatter(),
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.StackInfoRenderer(),
    structlog.processors.format_exc_info,
    structlog.processors.UnicodeDecoder(),
]

structlog_post_processors = [
    SentryJsonProcessor(level=logging.ERROR, tag_keys="__all__"),
    structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
]

structlog.configure(
    processors=[structlog.stdlib.filter_by_level]
    + shared_processors
    + structlog_post_processors,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

# Logging config
# ==============
formatter = structlog.stdlib.ProcessorFormatter(
    processor=structlog.processors.JSONRenderer(), foreign_pre_chain=shared_processors
)
handler = logging.StreamHandler()
handler.setFormatter(formatter)

root_logger = logging.getLogger()
root_logger.addHandler(handler)
root_logger.setLevel(logging.INFO)


# Celery logging
# ==============
@task_prerun.connect
def log_task_context(sender, task_id, task, *args, **kwargs):
    structlog.threadlocal.bind_threadlocal(task_id=task_id, task=task.name)


@task_postrun.connect
def remove_task_context_logging(*args, **kwargs):
    structlog.threadlocal.clear_threadlocal()


@setup_logging.connect
def setup_basic_logging(*args, **kwargs):
    logging.basicConfig(format="%(message)s", stream=sys.stdout, level=logging.INFO)


def construct_failure_message(task_name, exception, affected_records):
    """Construct a failure message based on the task name, exception, and affected records."""
    if not isinstance(affected_records, list):
        affected_records = [affected_records]
    affected_records = "\n".join(f"- {record}" for record in affected_records)
    return f"**Task name**: `{task_name}`\n\n **Error message**: {exception} \n\n **Affected record(s)**:\n {affected_records}"


def get_failure_message_by_task(task_name, exception, kwargs):
    """Return a failure message based on the task name."""
    task_messages = {
        "inspirehep.indexer.tasks.batch_index": construct_failure_message(
            task_name, exception, kwargs.get("records_uuids", "Unknown records")
        ),
        "inspirehep.indexer.tasks.index_record": construct_failure_message(
            task_name, exception, kwargs.get("uuid", "Unknown record")
        ),
    }
    return task_messages.get(task_name)


@shared_task(
    ignore_result=True,
    soft_time_limit=5,
    time_limit=10,
)
def send_zulip_notification_async(message):
    """Send a Zulip notification asynchronously."""
    send_zulip_notification(message)


@task_failure.connect
def log_error(
    sender=None,
    task_id=None,
    exception=None,
    args=None,
    kwargs=None,
    traceback=None,
    einfo=None,
    *signal_args,
    **signal_kwargs,
):
    logger = structlog.get_logger()
    logger.error(
        "Celery task failed",
        task_id=task_id,
        exc_info=(type(exception), exception, traceback),
        task_args=args,
        task_kwargs=kwargs,
    )
    task_name = sender.name if sender else "Unknown Task"
    message = get_failure_message_by_task(task_name, exception, kwargs)
    if message:
        send_zulip_notification_async.delay(message)
