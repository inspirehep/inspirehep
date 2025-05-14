from opensearchpy import OpenSearch
from django.conf import settings


def get_opensearch_client():
    hosts_config = settings.OPENSEARCH_DSL.get("default", {}).get("hosts", [])
    host, port = (
        hosts_config.split(":")
        if isinstance(hosts_config, str)
        else hosts_config[0].split(":")
    )

    return OpenSearch(hosts=[{"host": host, "port": port}])
