# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import random
import string

from flask import current_app
from inspire_utils.name import ParsedName
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_pidstore.providers.base import BaseProvider
from unidecode import unidecode

from inspirehep.pidstore.errors import (
    CannotGenerateUniqueTexKey,
    NoAvailableTexKeyFound,
    PIDAlreadyExistsError,
    TexkeyCannotGenerateFirstPart,
    TexkeyCannotGenerateSecondPart,
)
from inspirehep.records.utils import get_literature_earliest_date


class InspireTexKeyProvider(BaseProvider):
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
        if "authors" in data and len(data["authors"]) < 10:
            return cls.sanitize(
                ParsedName.loads(data["authors"][0].get("full_name")).last
            )
        elif "collaborations" in data:
            return cls.sanitize(data["collaborations"][0]["value"])
        elif "corporate_author" in data:
            return cls.sanitize(data["corporate_author"][0])
        elif "proceedings" in data["document_type"]:
            return cls.sanitize("Proceedings")
        elif "authors" in data:
            return cls.sanitize(
                ParsedName.loads(data["authors"][0].get("full_name")).last
            )
        raise TexkeyCannotGenerateFirstPart

    @classmethod
    def build_texkey_second_part(cls, data):
        date = get_literature_earliest_date(data)
        if date:
            return date.split("-", 1)[0]
        raise TexkeyCannotGenerateSecondPart

    @classmethod
    def get_texkey_with_random_part(cls, texkey):
        retry_count = current_app.config.get("PIDSTORE_TEXKEY_MAX_RETRY_COUNT", 5)
        size = current_app.config.get("PIDSTORE_TEXKEY_RANDOM_PART_SIZE", 3)
        used_texkeys = cls.query_all_texkeys_starting_with(texkey)
        for _ in range(retry_count):
            random_part = "".join(
                random.choices(string.ascii_lowercase + string.digits, k=size)
            )
            pid_value = f"{texkey}{random_part}"
            if pid_value not in used_texkeys:
                return pid_value
        raise CannotGenerateUniqueTexKey

    @classmethod
    def query_pid_for_texkey(cls, texkey):
        texkey = (
            PersistentIdentifier.query.filter(PersistentIdentifier.pid_value == texkey)
            .filter(PersistentIdentifier.pid_type == cls.pid_type)
            .one_or_none()
        )
        return texkey

    @classmethod
    def query_all_texkeys_starting_with(cls, texkey):
        return {
            result[0]
            for result in PersistentIdentifier.query.with_for_update()
            .with_entities(PersistentIdentifier.pid_value)
            .filter(PersistentIdentifier.pid_type == cls.pid_type)
            .filter(PersistentIdentifier.pid_value.startswith(texkey))
        }

    @classmethod
    def is_texkey_assigned_correctly(cls, texkey, uuid):
        texkey = cls.query_pid_for_texkey(texkey)
        if (
            texkey
            and texkey.object_uuid == uuid
            and texkey.status == PIDStatus.REGISTERED
        ):
            return True
        elif texkey:
            raise PIDAlreadyExistsError(texkey.pid_type, texkey.pid_value)
        return False

    @classmethod
    def create_or_update_texkey_in_pidstore(cls, texkey, uuid):
        texkey = cls.query_pid_for_texkey(texkey)
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
            texkey = cls.create_or_update_texkey_in_pidstore(pid_value, object_uuid)
            if texkey:
                return
            return super().create(
                pid_value=pid_value,
                status=PIDStatus.REGISTERED,
                object_type=object_type,
                object_uuid=object_uuid,
                **kwargs,
            )
        else:
            first_part = cls.build_texkey_first_part(data)
            second_part = cls.build_texkey_second_part(data)
            if first_part and second_part:
                new_texkey = f"{first_part}:{second_part}"
                texkeys_from_metadata = data.get("texkeys", [])
                if len(texkeys_from_metadata) == 0 or not texkeys_from_metadata[
                    0
                ].startswith(new_texkey):
                    return super().create(
                        pid_value=cls.get_texkey_with_random_part(new_texkey),
                        status=PIDStatus.REGISTERED,
                        object_type=object_type,
                        object_uuid=object_uuid,
                        **kwargs,
                    )
                return
        raise NoAvailableTexKeyFound(object_uuid)

    @classmethod
    def get(cls, pid_value, object_uuid=None):
        return cls(
            PersistentIdentifier.query.filter(
                PersistentIdentifier.pid_type == cls.pid_type
            )
            .filter(PersistentIdentifier.pid_value == pid_value)
            .filter(PersistentIdentifier.pid_provider == cls.pid_provider)
            .filter(PersistentIdentifier.object_uuid == object_uuid)
            .one()
        )
