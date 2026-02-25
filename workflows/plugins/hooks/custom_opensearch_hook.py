from functools import cached_property

from airflow.providers.opensearch.hooks.opensearch import OpenSearchHook
from opensearchpy import OpenSearch


class CustomOpenSearchHook(OpenSearchHook):
    @cached_property
    def client(self) -> OpenSearch:
        client_args = dict(
            hosts=[{"host": self.conn.host, "port": self.conn.port}],
            connection_class=self.connection_class,
        )
        if self.conn.login and self.conn.password:
            client_args["http_auth"] = (self.conn.login, self.conn.password)

        client_args.update(self.conn.extra_dejson)

        client = OpenSearch(**client_args)
        return client
