# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import random
import string

import structlog
from flask import current_app
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from sqlalchemy.exc import IntegrityError
from unidecode import unidecode

from inspirehep.pidstore.errors import (
    CannotGenerateUniqueTexKey,
    NoAvailableTexKeyFound,
    PIDAlreadyExistsError,
    TexkeyCannotGenerateFirstPart,
    TexkeyCannotGenerateSecondPart,
)
from inspirehep.pidstore.providers.base import InspireBaseProvider
from inspirehep.records.utils import get_literature_earliest_date

LOGGER = structlog.getLogger()


class InspireTexKeyProvider(InspireBaseProvider):
    pid_type = "texkey"
    pid_provider = "texkey"
    default_status = PIDStatus.RESERVED

    @classmethod
    def sanitize(cls, name):
        name = unidecode(name)
        name = "".join(
            filter(lambda x: x in set(string.ascii_letters + string.digits + "-"), name)
        )
        return name

    @classmethod
    def build_texkey_first_part(cls, data):
        full_name = get_value(data, "authors[0].full_name")
        if full_name:
            parsed_name = ParsedName.loads(full_name)
            parsed_name = (
                parsed_name.last if len(parsed_name) > 1 else full_name.split(",")[0]
            )
        else:
            parsed_name = None

        if parsed_name and len(data["authors"]) < 10:
            return cls.sanitize(parsed_name)
        elif "collaborations" in data:
            return cls.sanitize(data["collaborations"][0]["value"])
        elif "corporate_author" in data:
            return cls.sanitize(data["corporate_author"][0])
        elif "proceedings" in data["document_type"]:
            return cls.sanitize("Proceedings")
        elif parsed_name:
            return cls.sanitize(parsed_name)
        return None

    @classmethod
    def build_texkey_second_part(cls, data):
        date = get_literature_earliest_date(data)
        if date:
            return date.split("-", 1)[0]
        None

    @classmethod
    def get_texkey_with_random_part(cls, texkey):
        retry_count = current_app.config.get("PIDSTORE_TEXKEY_MAX_RETRY_COUNT", 5)
        size = current_app.config.get("PIDSTORE_TEXKEY_RANDOM_PART_SIZE", 3)
        used_texkeys = cls.query_all_texkeys_starting_with(texkey)
        for _ in range(retry_count):
            random_part = "".join(random.choices(string.ascii_lowercase, k=size))
            pid_value = f"{texkey}{random_part}"
            if pid_value not in used_texkeys:
                return pid_value
        raise CannotGenerateUniqueTexKey

    @classmethod
    def query_all_texkeys_starting_with(cls, texkey):
        return {
            result[0]
            for result in PersistentIdentifier.query.with_entities(
                PersistentIdentifier.pid_value
            )
            .filter(PersistentIdentifier.pid_type == cls.pid_type)
            .filter(PersistentIdentifier.pid_value.startswith(texkey))
        }

    @classmethod
    def update_texkey_in_pidstore(cls, texkey, uuid):
        """Try to update texkey in pidstore if it exists and can be updated."""
        texkey = cls.query_pid(texkey).one_or_none()
        if texkey:
            if texkey.status == PIDStatus.DELETED:
                texkey.object_uuid = uuid
                texkey.status = PIDStatus.REGISTERED
            elif texkey.object_uuid != uuid and texkey.status == PIDStatus.REGISTERED:
                raise PIDAlreadyExistsError(cls.pid_type, texkey)
        return texkey

    @classmethod
    def create(
        cls, object_type=None, object_uuid=None, data=None, pid_value=None, **kwargs
    ):
        if pid_value:
            texkey = cls.update_texkey_in_pidstore(pid_value, object_uuid)
            if not texkey:
                return super().create(
                    pid_value=pid_value,
                    status=PIDStatus.REGISTERED,
                    object_type=object_type,
                    object_uuid=object_uuid,
                    **kwargs,
                )
            return

        first_part = cls.build_texkey_first_part(data)
        if not first_part:
            raise TexkeyCannotGenerateFirstPart
        second_part = cls.build_texkey_second_part(data)
        if not second_part:
            raise TexkeyCannotGenerateSecondPart

        new_texkey = f"{first_part}:{second_part}"
        texkeys_from_metadata = data.get("texkeys", [])

        if len(texkeys_from_metadata) > 0 and texkeys_from_metadata[0].startswith(
            new_texkey
        ):
            # Correct texkey is currently assigned to record
            return None

        for _ in range(current_app.config.get("PIDSTORE_TEXKEY_MAX_RETRY_COUNT", 5)):
            full_texkey_generated = cls.get_texkey_with_random_part(new_texkey)
            if not full_texkey_generated:
                break
            try:
                with db.session.begin_nested():
                    new_texkey_pid = super().create(
                        pid_value=full_texkey_generated,
                        status=PIDStatus.REGISTERED,
                        object_type=object_type,
                        object_uuid=object_uuid,
                        **kwargs,
                    )
            except IntegrityError:
                LOGGER.warning(
                    "Failure while creating TEXKEY. Specified TEXKEY already exists! - Retrying",
                    pid_value=full_texkey_generated,
                    object_uuid=object_uuid,
                )
                continue

            return new_texkey_pid
        raise NoAvailableTexKeyFound

    @classmethod
    def query_pid(cls, pid_value, object_uuid=None, object_type="rec"):
        query = (
            PersistentIdentifier.query.filter(
                PersistentIdentifier.pid_type == cls.pid_type
            )
            .filter(PersistentIdentifier.pid_value == pid_value)
            .filter(PersistentIdentifier.pid_provider == cls.pid_provider)
        )
        if object_uuid:
            query = query.filter(
                PersistentIdentifier.object_uuid == object_uuid,
                PersistentIdentifier.object_type == object_type,
            )
        return query

    @classmethod
    def get(cls, pid_value, object_uuid=None):

        return cls(cls.query_pid(pid_value, object_uuid).one())
