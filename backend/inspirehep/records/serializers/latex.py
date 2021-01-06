# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.json import MarshmallowMixin, PreprocessorMixin
from invenio_records_rest.serializers.response import (
    record_responsify,
    search_responsify,
)

from ..marshmallow.literature.latex import LatexSchema
from .jinja import jinja_latex_env


class LatexSerializer(MarshmallowMixin, PreprocessorMixin):
    """Latex serializer for records."""

    def __init__(self, format, **kwargs):
        """Initialize record."""
        self.format = format
        super(LatexSerializer, self).__init__(**kwargs)

    def serialize(self, pid, record, links_factory=None, **kwargs):
        """Serialize a single record and persistent identifier.

        :param pid: Persistent identifier instance.
        :param record: Record instance.
        :param links_factory: Factory function for record links.
        """
        data = self.transform_record(pid, record, links_factory, **kwargs)

        return self.latex_template().render(data=data, format=self.format)

    def preprocess_record(self, pid, record, links_factory=None, **kwargs):
        """Prepare a record and persistent identifier for serialization."""
        return record

    def latex_template(self):
        latex_jinja_env = jinja_latex_env
        template = latex_jinja_env.get_template("latex_template.tex")

        return template

    def serialize_search(
        self, pid_fetcher, search_result, links=None, item_links_factory=None
    ):
        """Serialize search result(s).

        Args:
            pid_fetcher: Persistent identifier fetcher.
            search_result: Elasticsearch search result.
            links: Dictionary of links to add to response.

        Returns:
            str: serialized search result(s)
        """
        records = [
            hit["_source"].get(f"_latex_{self.format.lower()}_display", "")
            for hit in search_result["hits"]["hits"]
        ]
        return "\n\n".join(records)


latex_EU = LatexSerializer("EU", schema_class=LatexSchema)
latex_US = LatexSerializer("US", schema_class=LatexSchema)
latex_response_eu = record_responsify(
    latex_EU, "application/vnd+inspire.latex.eu+x-latex"
)
latex_response_us = record_responsify(
    latex_US, "application/vnd+inspire.latex.us+x-latex"
)
literature_latex_eu_response_search = search_responsify(
    latex_EU, "application/vnd+inspire.latex.eu+x-latex"
)
literature_latex_us_response_search = search_responsify(
    latex_US, "application/vnd+inspire.latex.us+x-latex"
)
