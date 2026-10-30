#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


class OAISetSpecUpdateError(Exception):
    """Spec attribute cannot be updated.

    The correct way is to delete the set and create a new one.
    """
