import click
import requests
from elasticsearch_dsl import Q
from flask.cli import with_appcontext

from inspirehep.curation.tasks import update_pdg_keywords_in_records
from inspirehep.search.api import LiteratureSearch
from inspirehep.utils import chunker


@click.group()
def curation():
    """Commands for curation"""


@curation.command("update-pdg-keywords")
@click.option("--url", help="URL pointing to PDG JSON data")
@with_appcontext
@click.pass_context
def update_pdg_keywords(ctx, url):
    pdg_json_response = requests.get(url, headers={"Accept": "application/json"})

    if pdg_json_response.status_code != 200:
        click.secho("Couldn't fetch PDG json data")
        ctx.exit(1)

    pdg_json_data = pdg_json_response.json()
    record_ids_pdg_keywords_dict = {
        record["inspireId"]: record["pdgIdList"] for record in pdg_json_data
    }
    records_with_pdg_keywords_query = Q("match", keywords__schema="PDG")
    search_obj = (
        LiteratureSearch()
        .query(records_with_pdg_keywords_query)
        .params(size=1000, scroll="60m", _source=["control_number"])
    )
    records_with_pdg_recids = (rec["control_number"] for rec in search_obj.scan())

    for batch in chunker(records_with_pdg_recids, 50):
        update_pdg_keywords_in_records.delay(batch, record_ids_pdg_keywords_dict)
