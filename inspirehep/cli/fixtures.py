# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
from flask.cli import with_appcontext

from inspirehep.accounts.fixtures import init_oauth_token, init_users_and_permissions
from inspirehep.records.fixtures import (
    init_default_storage_path,
    init_records_files_storage_path,
)


@click.group()
def fixtures():
    """Command related to records in inspire"""


@fixtures.command()
@with_appcontext
def init():
    init_users_and_permissions()
    init_default_storage_path()
    init_records_files_storage_path()
    init_oauth_token()
