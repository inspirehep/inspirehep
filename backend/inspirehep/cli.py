# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
# flake8: noqa


from invenio_base.app import create_cli

from inspirehep.countries.cli import countries
from inspirehep.factory import create_app
from inspirehep.files.cli import files
from inspirehep.fixtures import fixtures
from inspirehep.indexer.cli import index
from inspirehep.mailing.cli import mailing
from inspirehep.orcid.cli import orcid
from inspirehep.records.cli import citations, importer, jobs
from inspirehep.sitemap.cli import sitemap

cli = create_cli(create_app=create_app)

cli.add_command(citations)
cli.add_command(countries)
cli.add_command(files)
cli.add_command(fixtures)
cli.add_command(importer)
cli.add_command(index)
cli.add_command(jobs)
cli.add_command(mailing)
cli.add_command(orcid)
cli.add_command(sitemap)
