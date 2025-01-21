FROM opensearchproject/opensearch:2.18.0

RUN /usr/share/opensearch/bin/opensearch-plugin install --batch repository-s3
RUN /usr/share/opensearch/bin/opensearch-plugin install --batch analysis-icu
RUN /usr/share/opensearch/bin/opensearch-plugin install --batch ingest-attachment
