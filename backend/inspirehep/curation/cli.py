import click
import requests
from elasticsearch_dsl import Q
from flask.cli import with_appcontext
from invenio_db import db

from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.search.api import LiteratureSearch


def _remove_pdg_keywords_from_record_keywords(record):
    record_keywords = record["keywords"]
    for keyword_idx, keyword_object in enumerate(record_keywords):
        if keyword_object.get("schema") == "PDG":
            del record_keywords[keyword_idx]
    if not record_keywords:
        del record["keywords"]


def _update_record_keywords_with_new_pdg_keywords(record, pdg_keywords):
    keywords = record.get("keywords", [])
    for pdg_keyword in pdg_keywords:
        keywords.append({"schema": "PDG", "value": pdg_keyword})
    if keywords:
        record["keywords"] = keywords


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
    updated_recids = set()

    records_with_pdg_keywords_query = Q("match", keywords__schema="PDG")
    search_obj = (
        LiteratureSearch()
        .query(records_with_pdg_keywords_query)
        .params(size=1000, scroll="60m")
    )
    for rec in search_obj.scan():
        record = LiteratureRecord.get_record_by_pid_value(rec["control_number"])
        _remove_pdg_keywords_from_record_keywords(record)
        if record["control_number"] in record_ids_pdg_keywords_dict:
            _update_record_keywords_with_new_pdg_keywords(
                record, record_ids_pdg_keywords_dict[record["control_number"]]
            )
        record.update(dict(record))
        updated_recids.add(record["control_number"])

    new_records_with_pdg_keywords_recids = [
        ("lit", str(recid))
        for recid in set(record_ids_pdg_keywords_dict).difference(updated_recids)
    ]
    new_records_with_pdg_keywords = LiteratureRecord.get_records_by_pids(
        new_records_with_pdg_keywords_recids
    )

    for record in new_records_with_pdg_keywords:
        if record.get("keywords", []):
            _remove_pdg_keywords_from_record_keywords(record)
        _update_record_keywords_with_new_pdg_keywords(
            record, record_ids_pdg_keywords_dict[record["control_number"]]
        )
        record.update(dict(record))
        updated_recids.add(record["control_number"])

    db.session.commit()
    click.secho(f"Updated {len(updated_recids)} records with PDG keywords")
    click.secho(f"Updated recids: {updated_recids}")
