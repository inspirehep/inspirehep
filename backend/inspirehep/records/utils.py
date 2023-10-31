# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from io import BytesIO
from itertools import chain

import pdfplumber
import requests
import structlog
from flask import current_app
from inspire_dojson.utils import get_recid_from_ref, get_record_ref
from inspire_utils.date import earliest_date
from inspire_utils.helpers import force_list, maybe_int
from inspire_utils.record import get_value, get_values_for_schema
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from sqlalchemy.orm import aliased

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.errors import DownloadFileError, FileSizeExceededError
from inspirehep.submissions.tasks import async_create_ticket_with_template
from inspirehep.utils import get_inspirehep_url

LOGGER = structlog.getLogger()


def get_literature_earliest_date(data):
    """Returns earliest date.

    Returns:
        str: earliest date represented in a string
    """
    date_paths = [
        "preprint_date",
        "thesis_info.date",
        "thesis_info.defense_date",
        "publication_info.year",
        "imprints.date",
    ]

    dates = [
        str(el)
        for el in chain.from_iterable(
            force_list(get_value(data, path)) for path in date_paths
        )
    ]

    if dates:
        result = earliest_date(dates)
        if result:
            return result

    return None


def requests_retry_session(retries=3):
    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


def download_file_from_url(url, check_file_size=False):
    download_url = url if url.startswith("http") else f"{get_inspirehep_url()}{url}"
    max_retries = current_app.config.get("FILES_DOWNLOAD_MAX_RETRIES", 3)
    try:
        request = requests_retry_session(retries=max_retries).get(
            download_url,
            stream=True,
            timeout=current_app.config.get("FILES_DOWNLOAD_TIMEOUT", 60),
        )
        request.raise_for_status()

        file_size_limit = current_app.config["FILES_SIZE_LIMIT"]
        content_length = request.headers.get("content-length")

        if content_length and isinstance(content_length, str):
            content_length = int(content_length)

        if check_file_size and content_length and content_length > file_size_limit:

            raise FileSizeExceededError(
                f"Can't download file from url {download_url}. File size {content_length} is larger than the limit {file_size_limit}."
            )
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


def get_author_by_bai(literature_record, author_bai):
    return next(
        author
        for author in literature_record.get("authors")
        if get_values_for_schema(author.get("ids", []), "INSPIRE BAI") == [author_bai]
    )


def get_author_by_recid(literature_record, author_recid):
    lit_authors_recids = {
        get_recid_from_ref(author["record"]): author
        for author in literature_record.get("authors", [])
        if "record" in author
    }
    lit_author_found = lit_authors_recids.get(maybe_int(author_recid))

    if not lit_author_found:
        LOGGER.warning(
            "Author not found in literature authors",
            lit_authors_recids=lit_authors_recids.keys(),
            author_recid=author_recid,
            literature_recid=literature_record["control_number"],
        )
    return lit_author_found


def remove_author_bai_from_id_list(author):
    if not author.get("ids"):
        return
    author["ids"] = [
        author_id for author_id in author["ids"] if author_id["schema"] != "INSPIRE BAI"
    ]


def is_document_scanned(file_data):
    byte_stream = BytesIO(file_data)
    with pdfplumber.open(byte_stream) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                return False
    return True


def _create_ticket_self_curation(record_control_number, record_revision_id, user_email):
    INSPIREHEP_URL = get_inspirehep_url()
    template_payload = {
        "diff_url": f"{INSPIREHEP_URL}/literature/{record_control_number}/diff/{record_revision_id -1}..{record_revision_id}",
        "user_email": user_email,
    }
    async_create_ticket_with_template.delay(
        queue="References",
        template_path="snow/self_curation.html",
        template_context=template_payload,
        title=f"reference self-curation for record {record_control_number}",
        requestor=None,
        recid=record_control_number,
    )


def get_changed_reference(old_record_version, new_record_version):
    old_references = old_record_version.get("references", [])
    new_references = new_record_version.get("references", [])
    for idx, (old_ref, new_ref) in enumerate(zip(old_references, new_references)):
        if old_ref != new_ref:
            return {
                "current_version": new_ref,
                "previous_version": old_ref,
                "reference_index": idx,
            }
