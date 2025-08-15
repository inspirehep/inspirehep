from datetime import datetime

import structlog
from flask import current_app
from inspirehep.config import EDITOR_LOCK_EXPIRATION_TIME
from redis import StrictRedis

LOGGER = structlog.getLogger()


class EditorSoftLock:
    def __init__(self, recid, record_version, user_email=None, task_name=None):
        if not (task_name or user_email):
            raise ValueError("User mail or task name must be passed")
        if user_email:
            self.is_user_lock = True
            self.key = user_email
        else:
            self.is_user_lock = False
            self.key = task_name
        self.recid = recid
        self.record_version = record_version

    @property
    def redis(self):
        redis_url = current_app.config.get("CACHE_REDIS_URL")
        redis = StrictRedis.from_url(redis_url)
        return redis

    @property
    def hash_name(self):
        if self.is_user_lock:
            return self._get_hash_name_for_edited_record()["user"]
        return self._get_hash_name_for_edited_record()["task"]

    @property
    def message(self):
        if self.is_user_lock:
            return f"{self.key} at {datetime.now().isoformat()}"
        return f"{self.key} at {datetime.now().isoformat()}"

    def _get_hash_name_for_edited_record(self):
        return {
            "user": f"editor-lock:{self.recid}@{self.record_version}",
            "task": f"editor-task-lock:{self.recid}@{self.record_version}",
        }

    def add_lock(self):
        self.redis.hset(self.hash_name, key=self.key, value=self.message)
        self.redis.expire(self.hash_name, time=EDITOR_LOCK_EXPIRATION_TIME)

    def remove_lock(self):
        self.redis.hdel(self.hash_name, self.key)

    def prepare_editor_lock_api_payload(self):
        payload = {}
        existing_user_locks = ", ".join(
            [
                value.decode()
                for value in self.redis.hgetall(
                    self._get_hash_name_for_edited_record()["user"]
                ).values()
            ]
        ).strip(", ")
        existing_task_locks = ", ".join(
            [
                value.decode()
                for value in self.redis.hgetall(
                    self._get_hash_name_for_edited_record()["task"]
                ).values()
            ]
        ).strip(", ")
        if existing_user_locks:
            editor_user_lock_msg = (
                f"Record opened by {existing_user_locks} Their modifications aren't"
                " saved yet, they (or yours) might get lost."
            )
            payload["user_locks"] = editor_user_lock_msg
        elif existing_task_locks:
            editor_task_lock_msg = (
                f"Scheduled tasks: {existing_task_locks}. Your modifications might get"
                " lost"
            )
            payload["task_locks"] = editor_task_lock_msg
        return payload
