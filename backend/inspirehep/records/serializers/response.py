# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app
from invenio_records_rest.serializers.response import add_link_header


def record_responsify(serializer, mimetype):
    """Create a Records-REST response serializer.

    :param serializer: Serializer instance.
    :param mimetype: MIME type of response.
    :returns: Function that generates a record HTTP response.

    NOTE:
      This removes Last-Modified header and set Content-Type aware Etag.

      We do that in order to avoid browser caching issues. Most of the browsers use both Last-Modified
      and Etag, and as long as any of them matches, they use the cache. This causes, for example browser
      is using `application/json` cache for `application/x-bibtex` request.
    """

    def view(pid, record, code=200, headers=None, links_factory=None):
        response = current_app.response_class(
            serializer.serialize(pid, record, links_factory=links_factory),
            mimetype=mimetype,
        )
        response.status_code = code
        etag = f"{response.headers.get('Content-Type')}@v{record.revision_id}"
        response.set_etag(etag)
        if headers is not None:
            response.headers.extend(headers)

        if links_factory is not None:
            add_link_header(response, links_factory(pid))

        return response

    return view
