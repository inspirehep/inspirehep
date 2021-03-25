# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import numpy as np
import requests
from beard.clustering import block_phonetic
from flask import current_app
from inspire_dojson.utils import get_record_ref
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from sqlalchemy.orm import aliased

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.errors import DownloadFileError
from inspirehep.utils import get_inspirehep_url


def get_authors_phonetic_blocks(full_names, phonetic_algorithm="nysiis"):
    """Create a dictionary of phonetic blocks for a given list of names."""

    # The method requires a list of dictionaries with full_name as keys.
    full_names_formatted = [{"author_name": i} for i in full_names]

    # Create a list of phonetic blocks.
    phonetic_blocks = list(
        block_phonetic(
            np.array(full_names_formatted, dtype=np.object).reshape(-1, 1),
            threshold=0,
            phonetic_algorithm=phonetic_algorithm,
        )
    )

    return dict(zip(full_names, phonetic_blocks))


def requests_retry_session(retries=3):
    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def download_file_from_url(url):
    download_url = url if url.startswith("http") else f"{get_inspirehep_url()}{url}"
    max_retries = current_app.config.get("FILES_DOWNLOAD_MAX_RETRIES", 3)
    try:
        request = requests_retry_session(retries=max_retries).get(
            download_url,
            stream=True,
            timeout=current_app.config.get("FILES_DOWNLOAD_TIMEOUT", 60),
        )
        request.raise_for_status()
    except requests.exceptions.RequestException as exc:
        raise DownloadFileError(
            f"Cannot download file from url {download_url}. Reason: {exc}"
        )
    return request.content


def get_pid_for_pid(pid_type, pid_value, provider):
    """Returns pid of requested provider registered in PIDStore for record with provided
    pit_type and pid_value
    Args:
        pid_type(str): provided pid_type
        pid_value(str): provided pid_value
        provider(str): provider for which pid should be returned

    Returns: pid_value for requested record and requested pid provider
    """
    ext_pid = aliased(PersistentIdentifier)
    pid = aliased(PersistentIdentifier)
    query = db.session.query(pid.pid_value).filter(
        pid.object_uuid == ext_pid.object_uuid,
        pid.object_type == ext_pid.object_type,
        ext_pid.object_type == "rec",
        ext_pid.pid_type == pid_type,
        ext_pid.pid_value == pid_value,
        pid.pid_provider == provider,
        pid.status == PIDStatus.REGISTERED,
        ext_pid.status == PIDStatus.REGISTERED,
    )
    return query.scalar()


def get_ref_from_pid(pid_type, pid_value):
    """Return full $ref for record with pid_type and pid_value"""
    return get_record_ref(pid_value, PidStoreBase.get_endpoint_from_pid_type(pid_type))
