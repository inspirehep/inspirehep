# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask_alembic import Alembic


def clean_db(db):
    db.session.close()
    db.reflect()
    db.drop_all()
    db.engine.execute(
        """
        DROP SEQUENCE IF EXISTS transaction_id_seq;
        DROP TYPE IF EXISTS source_enum;
        """
    )
    db.session.close()


def setup_db(app):
    alembic = Alembic(app)
    alembic.upgrade()
