# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.api.mixins import AddressMixin
from inspirehep.records.marshmallow.institutions import InstitutionsElasticSearchSchema

from ...pidstore.api import PidStoreInstitutions
from ..models import InstitutionLiterature
from .base import InspireRecord


class InstitutionsRecord(AddressMixin, InspireRecord):
    """Institutions Record."""

    es_serializer = InstitutionsElasticSearchSchema
    pid_type = "ins"
    pidstore_handler = PidStoreInstitutions

    def delete_relations_with_literature(self):
        InstitutionLiterature.query.filter_by(institution_uuid=self.id).delete()

    def delete(self):
        super().delete()
        self.delete_relations_with_literature()

    def hard_delete(self):
        self.delete_relations_with_literature()
        super().hard_delete()

    @property
    def number_of_papers(self):
        return InstitutionLiterature.query.filter_by(institution_uuid=self.id).count()
