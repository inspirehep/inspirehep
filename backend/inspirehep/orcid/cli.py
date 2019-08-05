# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
from flask.cli import with_appcontext

from inspirehep.orcid.tasks import import_legacy_orcid_tokens


@click.group()
def orcid():
    """Commands to run ORCID tasks."""


@orcid.command("import-legacy-tokens")
@with_appcontext
def import_legacy_tokens():
    """Import ORCID tokens from legacy."""
    import_legacy_orcid_tokens()
