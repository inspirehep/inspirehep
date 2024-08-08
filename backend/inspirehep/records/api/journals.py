#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.pidstore.api import PidStoreJournals
from inspirehep.records.api.base import InspireRecord
from inspirehep.records.marshmallow.journals import JournalsElasticSearchSchema
from inspirehep.records.models import JournalLiterature


class JournalsRecord(InspireRecord):
    """Journals Record."""

    es_serializer = JournalsElasticSearchSchema
    pid_type = "jou"
    pidstore_handler = PidStoreJournals

    def delete_relations_with_literature(self):
        JournalLiterature.query.filter_by(journal_uuid=self.id).delete()

    def delete(self):
        super().delete()
        self.delete_relations_with_literature()

    def hard_delete(self):
        self.delete_relations_with_literature()
        super().hard_delete()

    @property
    def number_of_papers(self):
        return JournalLiterature.query.filter_by(journal_uuid=self.id).count()
