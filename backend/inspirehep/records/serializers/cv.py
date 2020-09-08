# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

import jinja2
from flask import current_app
from invenio_records_rest.serializers.base import PreprocessorMixin
from invenio_records_rest.serializers.marshmallow import MarshmallowMixin
from invenio_records_rest.serializers.response import search_responsify

from inspirehep.records.marshmallow.literature.cv import CVSchema
from inspirehep.records.serializers.response import record_responsify


class CVHTMLSerializer(MarshmallowMixin, PreprocessorMixin):
    def __init__(self, **kwargs):
        super(CVHTMLSerializer, self).__init__(**kwargs)

    @staticmethod
    def cv_template():
        cv_jinja_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(os.path.abspath("/"))
        )  # noqa
        current_abs_path = os.path.abspath(__file__)
        directory_path = os.path.dirname(current_abs_path)
        template_path = os.path.join(directory_path, "templates/cv_html_template.html")
        template = cv_jinja_env.get_template(template_path)

        return template

    def serialize(self, pid, record, links_factory=None, **kwargs):
        data = self.transform_record(pid, record, links_factory, **kwargs)
        return self.cv_template().render(
            records=[data], host=current_app.config["SERVER_NAME"]
        )

    def preprocess_record(self, pid, record, links_factory=None, **kwargs):
        return record

    def serialize_search(
        self, pid_fetcher, search_result, links=None, item_links_factory=None
    ):
        records = (self.dump(hit["_source"]) for hit in search_result["hits"]["hits"])
        return self.cv_template().render(
            records=records, host=current_app.config["SERVER_NAME"]
        )


literature_cv_html = CVHTMLSerializer(schema_class=CVSchema)
literature_cv_html_response = record_responsify(
    literature_cv_html, "text/vnd+inspire.html+html"
)
literature_cv_html_response_search = search_responsify(
    literature_cv_html, "text/vnd+inspire.html+html"
)
