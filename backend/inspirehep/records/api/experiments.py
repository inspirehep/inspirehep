#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.pidstore.api import PidStoreExperiments
from inspirehep.records.api.base import InspireRecord
from inspirehep.records.marshmallow.experiments import ExperimentsElasticSearchSchema
from inspirehep.records.models import ExperimentLiterature


class ExperimentsRecord(InspireRecord):
    """Experiments Record."""

    es_serializer = ExperimentsElasticSearchSchema
    pid_type = "exp"
    pidstore_handler = PidStoreExperiments

    def delete_relations_with_literature(self):
        ExperimentLiterature.query.filter_by(experiment_uuid=self.id).delete()

    def delete(self):
        super().delete()
        self.delete_relations_with_literature()

    def hard_delete(self):
        self.delete_relations_with_literature()
        super().hard_delete()

    @property
    def number_of_papers(self):
        return ExperimentLiterature.query.filter_by(experiment_uuid=self.id).count()
