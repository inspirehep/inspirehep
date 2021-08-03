import subprocess

import click

DOCKER_FILES = "-f docker-compose.yml -f docker-compose.override.yml"
EDITOR = "records-editor"
UI = "ui"
BACKEND = "backend"


@click.group()
def cli():
    pass


@cli.command()
@click.argument("operation")
def ui(operation):
    """Run UI operations"""
    if operation == "build":
        click.echo("Building ui")
        command = ["cd ui; yarn build"]
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
        process.wait()
        if process.returncode == 0:
            click.echo(click.style("Success", fg="green"))
        else:
            click.echo(click.style("Error", fg="red"))
    else:
        click.echo(click.style(f"Command {operation} not found.", fg="red"))


@cli.command()
@click.argument("operation")
def editor(operation):
    """Run Editor operations."""
    if operation == "build":
        click.echo("Building editor")
        command = ["cd record-editor; yarn build"]
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
        process.wait()
        if process.returncode == 0:
            click.echo(click.style("Success", fg="green"))
        else:
            click.echo(click.style("Error", fg="red"))
    else:
        click.echo(click.style(f"Command {operation} not found.", fg="red"))


@cli.command()
@click.pass_context
@click.option("--without-ui", default=False, help="Not build ui", is_flag=True)
@click.option("--without-editor", default=False, help="Not build editor", is_flag=True)
def start(ctx, without_ui, without_editor):
    """Start all services."""

    if not without_ui:
        ctx.invoke(ui, operation="build")
    if not without_editor:
        ctx.invoke(editor, operation="build")

    command = [f"docker-compose {DOCKER_FILES} up -d"]
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    if process.returncode == 0:
        click.echo(click.style("Success", fg="green"))
    else:
        click.echo(click.style("Error", fg="red"))


@cli.command()
def setup_hep():
    click.echo("Setting up hep")
    command = [f"docker-compose {DOCKER_FILES} exec hep-web ./scripts/setup"]
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    if process.returncode == 0:
        click.echo(click.style("Success", fg="green"))
    else:
        click.echo(click.style("Error", fg="red"))


@cli.command()
def setup_next():
    click.echo("Setting up next")
    command = [f"docker-compose {DOCKER_FILES} exec next-web inspirehep db create"]
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    if process.returncode == 0:
        click.echo(click.style("Success", fg="green"))
    else:
        click.echo(click.style("Error", fg="red"))


@cli.command("insert-records")
def insert_records():
    click.echo("Inserting records")
    command = [
        f"docker-compose {DOCKER_FILES} exec hep-web inspirehep importer records -f data/records/authors/1010819.json -f data/records/conferences/1769332.json -f data/records/conferences/1794610.json -f data/records/conferences/1809034.json -f data/records/conferences/1776122.json -f data/records/conferences/1622944.json -f data/records/seminars/1811573.json -f data/records/seminars/1811750.json -f data/records/seminars/1811657.json -f data/records/seminars/1807692.json -f data/records/seminars/1807690.json -f data/records/jobs/1811684.json -f data/records/jobs/1812904.json -f data/records/jobs/1813119.json -f data/records/jobs/1811836.json -f data/records/jobs/1812529.json -f data/records/authors/1004662.json -f data/records/authors/1060898.json -f data/records/authors/1013725.json -f data/records/authors/1078577.json -f data/records/authors/1064002.json -f data/records/authors/1306569.json -f data/records/conferences/1787117.json -f data/records/literature/1787272.json -f data/records/seminars/1799778.json -f data/records/conferences/1217045.json -f data/records/jobs/1812440.json -f data/records/authors/1274753.json -f data/records/institutions/902858.json -f data/records/experiments/1513946.json -f data/records/literature/1331798.json -f data/records/literature/1325985.json -f data/records/literature/1306493.json -f data/records/literature/1264675.json -f data/records/literature/1263659.json -f data/records/literature/1263207.json -f data/records/literature/1249881.json -f data/records/literature/1235543.json -f data/records/literature/1198168.json -f data/records/literature/1113908.json -f data/records/literature/873915.json -f data/records/literature/1688995.json -f data/records/literature/1290484.json -f data/records/literature/1264013.json -f data/records/literature/1257993.json -f data/records/literature/1310649.json -f data/records/literature/1473056.json -f data/records/literature/1358394.json -f data/records/literature/1374620.json -f data/records/literature/1452707.json -f data/records/literature/1649231.json -f data/records/literature/1297062.json -f data/records/literature/1313615.json -f data/records/literature/1597429.json -f data/records/literature/1184194.json -f data/records/literature/1322719.json -f data/records/literature/1515024.json -f data/records/literature/1510263.json -f data/records/literature/1415120.json -f data/records/literature/1400808.json -f data/records/literature/1420712.json -f data/records/literature/1492108.json -f data/records/literature/1598135.json -f data/records/literature/1306493.json -f data/records/literature/1383683.json -f data/records/literature/1238110.json"
    ]
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    if process.returncode == 0:
        click.echo(click.style("Success", fg="green"))
    else:
        click.echo(click.style("Error", fg="red"))


@cli.command()
@click.pass_context
@click.option("--without-records", default=False, help="Insert records", is_flag=True)
def setup(ctx, without_records):
    """Setup inspirehep and inspire-next"""
    ctx.invoke(setup_hep)
    ctx.invoke(setup_next)
    if not without_records:
        ctx.invoke(insert_records)


if __name__ == "__main__":
    cli()
