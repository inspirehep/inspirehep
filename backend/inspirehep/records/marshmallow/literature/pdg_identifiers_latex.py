from pathlib import Path

import orjson


def build_mapping():
    identifiers_path = Path(__file__).parent / "data" / "PDGIdentifiers.json"
    identifiers = orjson.loads(identifiers_path.read_text())
    return {id_["pdgId"]: id_["description_tex"] for id_ in identifiers}


PDG_IDS_TO_LATEX_DESCRIPTION_MAPPING = build_mapping()
