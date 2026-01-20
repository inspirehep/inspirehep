FROM opensearchproject/opensearch:3.2.0

RUN /usr/share/opensearch/bin/opensearch-plugin install --batch repository-s3
RUN /usr/share/opensearch/bin/opensearch-plugin install --batch analysis-icu
RUN /usr/share/opensearch/bin/opensearch-plugin install --batch ingest-attachment
