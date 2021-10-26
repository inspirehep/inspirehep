# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.disambiguation.tasks import disambiguate_authors
from inspirehep.editor.editor_soft_lock import EditorSoftLock


def author_disambiguation(model_instance):
    disambiguate_authors.delay(str(model_instance.id), model_instance.version_id)
    editor_soft_lock = EditorSoftLock(
        recid=model_instance.json["control_number"],
        record_version=model_instance.version_id,
        task_name=disambiguate_authors.name,
    )
    editor_soft_lock.add_lock()
