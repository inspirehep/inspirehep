# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import json
import os

import click

from . import countries_code_to_name_dict, countries_name_to_code_dict


@click.group()
def countries():
    """Command to generate countries."""


@countries.command(help="Dumps the country list")
@click.option(
    "-p",
    "--path",
    required=True,
    help="The output path of the files.",
    type=click.Path(),
)
def dump(path):
    click.echo("Generating files ...")
    code_to_name_path = os.path.join(path, "code_to_name.json")
    with open(code_to_name_path, "w+") as outfile:
        json.dump(countries_code_to_name_dict, outfile)
    click.echo(f"Done {code_to_name_path}")

    name_to_code_path = os.path.join(path, "name_to_code.json")
    with open(name_to_code_path, "w+") as outfile:
        json.dump(countries_name_to_code_dict, outfile)
    click.echo(f"Done {name_to_code_path}")
