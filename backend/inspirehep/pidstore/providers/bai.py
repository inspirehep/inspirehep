# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import re
import string

import backoff
import structlog
from flask import current_app
from inspire_utils.name import format_name
from inspire_utils.record import get_value
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from sqlalchemy.exc import IntegrityError
from unidecode import unidecode

from inspirehep.pidstore.errors import PIDAlreadyExistsError
from inspirehep.pidstore.providers.base import InspireBaseProvider
from inspirehep.records.marshmallow.utils import get_first_value_for_schema

LOGGER = structlog.getLogger()


class InspireBAIProvider(InspireBaseProvider):
    """CNUM identifier provider."""

    pid_type = "bai"
    pid_provider = "bai"
    default_status = PIDStatus.RESERVED

    @classmethod
    def generate_bai(cls, data):
        name = get_value(data, "name.value")
        bai = ".".join(format_name(name, initials_only=True).split())
        bai = unidecode(bai)
        bai = "".join(filter(lambda x: x in set(string.ascii_letters + "."), bai))
        bai = re.sub(r"\.+", ".", bai).lstrip(".")
        if not bai.endswith("."):
            bai = f"{bai}."
        next_bai_number = cls.next_bai_number(bai)
        return f"{bai}{next_bai_number}"

    @classmethod
    def query_pid_value(cls, pid_value):
        return (
            PersistentIdentifier.query.filter(
                PersistentIdentifier.pid_value == pid_value
            )
            .filter(PersistentIdentifier.pid_type == cls.pid_type)
            .one_or_none()
        )

    @classmethod
    def next_bai_number(cls, bai):
        """Returns next possible free id for BAI

        Args:
            bai(str): Bai without number at the end (ex. K.Janeway)

        Returns:
            int: first free available id for specified BAI
        """
        all_similar_bais = [
            result[0]
            for result in PersistentIdentifier.query.with_entities(
                PersistentIdentifier.pid_value
            )
            .filter(PersistentIdentifier.pid_value.startswith(bai))
            .filter(PersistentIdentifier.pid_type == cls.pid_type)
        ]
        last_number = 0
        if all_similar_bais:
            all_bais_numbers = [int(x.rsplit(".", 1)[-1]) for x in all_similar_bais]
            last_number = max(all_bais_numbers)
        return int(last_number) + 1

    @classmethod
    @backoff.on_exception(
        backoff.constant,
        (IntegrityError, PIDAlreadyExistsError),
        max_tries=5,
        interval=5,
    )
    def create(
        cls, pid_value=None, object_uuid=None, data=None, object_type=None, **kwargs
    ):
        if not pid_value and not current_app.config.get(
            "FEATURE_FLAG_ENABLE_BAI_CREATION", False
        ):
            return
        pid_value = pid_value or get_first_value_for_schema(
            get_value(data, "ids", []), "INSPIRE BAI"
        )
        new_pid = pid_value or cls.generate_bai(data)
        pid_from_db = cls.query_pid_value(new_pid)
        if not pid_from_db:
            provider_object = super().create(
                pid_value=new_pid,
                object_type=object_type,
                object_uuid=object_uuid,
                status=PIDStatus.REGISTERED,
                **kwargs,
            )
        elif pid_from_db.object_uuid != object_uuid:
            raise PIDAlreadyExistsError(pid_value=pid_value, pid_type="bai")
        else:
            # Correct pid already assigned to this record
            provider_object = super().get(pid_value=pid_value)

        return provider_object

    def delete(self):
        try:
            PersistentIdentifier.query.filter_by(
                id=self.pid.id, object_uuid=self.pid.object_uuid
            ).delete()
        except PIDDoesNotExistError:
            LOGGER.warning("BAI not found", uuid=str(self.object_uuid))
