# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from textwrap import dedent

from flask import current_app
from invenio_records_rest.serializers.base import PreprocessorMixin
from invenio_records_rest.serializers.marshmallow import MarshmallowMixin
from invenio_records_rest.serializers.response import (
    record_responsify,
    search_responsify,
)

from inspirehep.records.marshmallow.literature.cv import CVSchema

from .jinja import jinja_cv_env


class CVHTMLSerializer(MarshmallowMixin, PreprocessorMixin):
    wrapping_html = dedent(
        """\
    <!DOCTYPE html>
    <html>
    <body>
      {body}
    </body>
    </html>
    """
    )

    def __init__(self, **kwargs):
        super(CVHTMLSerializer, self).__init__(**kwargs)

    @staticmethod
    def cv_template():
        cv_jinja_env = jinja_cv_env
        template = cv_jinja_env.get_template("cv_html_template.html")

        return template

    def serialize_inner(self, pid, record, links_factory=None, **kwargs):
        data = self.transform_record(pid, record, links_factory, **kwargs)
        return self.cv_template().render(
            record=data, host=current_app.config["SERVER_NAME"]
        )

    def serialize(self, pid, record, links_factory=None, **kwargs):
        body = self.serialize_inner(pid, record, links_factory=links_factory, **kwargs)
        return self.wrapping_html.format(body=body)

    def preprocess_record(self, pid, record, links_factory=None, **kwargs):
        return record

    def serialize_search(
        self, pid_fetcher, search_result, links=None, item_links_factory=None
    ):
        records = (
            hit["_source"].get("_cv_format", "")
            for hit in search_result["hits"]["hits"]
        )
        body = "\n  ".join(records)
        return self.wrapping_html.format(body=body)


literature_cv_html = CVHTMLSerializer(schema_class=CVSchema)
literature_cv_html_response = record_responsify(
    literature_cv_html, "text/vnd+inspire.html+html"
)
literature_cv_html_response_search = search_responsify(
    literature_cv_html, "text/vnd+inspire.html+html"
)
