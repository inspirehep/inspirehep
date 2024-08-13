#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


class SubGroupNotFound(Exception):
    def __init__(self, collaboration_id, subgroup, **kwargs):
        super().__init__(**kwargs)
        self.collaboration_id = collaboration_id
        self.subgroup_missing = subgroup
        self.message = (
            f"Subgroup {self.subgroup_missing} was not found in collaboration"
            f" {self.collaboration_id} (normalization problem)."
        )
