# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Inspirehep initial revision of migrations
which makes db identical like in inspire-next"""


# revision identifiers, used by Alembic.
revision = "7be4c8b5c5e8"
down_revision = "b5be5fda2ee7"
branch_labels = ()

"""Migrations which are required and inspirehep is depending on:
    07fb52561c5c - invenio-records,
    e12419831262 - invenio-accounts
"""
depends_on = "07fb52561c5c", "e12419831262"


def upgrade():
    # """Upgrade database."""
    pass


def downgrade():
    # """Downgrade database."""
    pass
