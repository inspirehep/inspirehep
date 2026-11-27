"""Declare Celery 5.3 event and control queues as exclusive for RabbitMQ."""

from celery import current_app
from celery.app.control import Control
from celery.app.events import Events
from celery.events.receiver import EventReceiver
from kombu.pidbox import Mailbox


class ExclusiveEventReceiver(EventReceiver):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.queue.exclusive = True


class ExclusiveEvents(Events):
    receiver_cls = ExclusiveEventReceiver


class ExclusiveMailbox(Mailbox):
    def get_queue(self, hostname):
        queue = super().get_queue(hostname)
        queue.exclusive = True
        return queue

    def get_reply_queue(self):
        queue = super().get_reply_queue()
        queue.exclusive = True
        return queue


class ExclusiveControl(Control):
    Mailbox = ExclusiveMailbox


def configure_celery_queues():
    # Flask-CeleryExt configures the current Celery app in both web and worker
    # processes. Set the queue components before the extensions initialize it.
    current_app.events_cls = ExclusiveEvents
    current_app.control_cls = ExclusiveControl
