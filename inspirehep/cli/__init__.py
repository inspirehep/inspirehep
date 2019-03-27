# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
# flake8: noqa


from invenio_base.app import create_cli

from inspirehep.cli.fixtures import fixtures
from inspirehep.cli.indexer import inspire_indexer
from inspirehep.factory import create_app
from inspirehep.records.cli import importer

cli = create_cli(create_app=create_app)

cli.add_command(fixtures)
cli.add_command(inspire_indexer)
cli.add_command(importer)
