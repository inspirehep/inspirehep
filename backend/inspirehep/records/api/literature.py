#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor, TimeoutError, as_completed
from io import BytesIO

import backoff
import magic
import orjson
import requests
import structlog
from flask import current_app
from idutils import is_doi, normalize_doi
from inspire_json_merger.api import merge
from inspire_schemas.api import validate
from inspire_schemas.builders import LiteratureBuilder
from inspire_schemas.parsers.arxiv import ArxivParser
from inspire_schemas.parsers.crossref import CrossrefParser
from inspire_schemas.utils import is_arxiv, normalize_arxiv
from inspire_utils.record import get_value
from invenio_db import db
from jsonschema import ValidationError
from pdfminer.pdftypes import PDFException

from inspirehep.disambiguation.tasks import disambiguate_authors
from inspirehep.files.api import current_s3_instance
from inspirehep.hal.api import push_to_hal
from inspirehep.orcid.api import push_to_orcid
from inspirehep.pidstore.api import PidStoreLiterature
from inspirehep.records.api.base import InspireRecord
from inspirehep.records.api.mixins import (
    CitationMixin,
    ConferencePaperAndProceedingsMixin,
    ExperimentPapersMixin,
    InstitutionPapersMixin,
    JournalPapersMixin,
)
from inspirehep.records.errors import (
    ExistingArticleError,
    ImportArticleNotFoundError,
    ImportParsingError,
    UnknownImportIdentifierError,
    UnsupportedFileError,
)
from inspirehep.records.marshmallow.literature import (
    LiteratureElasticSearchSchema,
    LiteratureFulltextElasticSearchSchema,
)
from inspirehep.records.utils import (
    download_file_from_url,
    get_literature_earliest_date,
    get_pid_for_pid,
    get_ref_from_pid,
    is_document_scanned,
    remove_author_bai_from_id_list,
)
from inspirehep.search.api import LiteratureSearch
from inspirehep.utils import chunker, hash_data

LOGGER = structlog.getLogger()

PLACEHOLDER = "<ID>"

ARXIV_URL = (
    "http://export.arxiv.org/oai2?"
    "verb=GetRecord&"
    "identifier=oai:arXiv.org:<ID>&"
    "metadataPrefix=arXiv"
)

CROSSREF_URL = "https://api.crossref.org/works/<ID>"


class LiteratureRecord(
    CitationMixin,
    ConferencePaperAndProceedingsMixin,
    ExperimentPapersMixin,
    InstitutionPapersMixin,
    JournalPapersMixin,
    InspireRecord,
):
    """Literature Record."""

    es_serializer = LiteratureElasticSearchSchema
    es_fulltext_serializer = LiteratureFulltextElasticSearchSchema
    pid_type = "lit"
    pidstore_handler = PidStoreLiterature
    nested_record_fields = ["authors", "publication_info", "supervisors"]

    @property
    def earliest_date(self):
        date = get_literature_earliest_date(self)
        if not date and self.created:
            date = self.created.strftime("%Y-%m-%d")
        return date

    def update_record_relationships(self):
        self.update_authors_records_table()
        self.update_refs_in_citation_table()
        self.update_conference_paper_and_proccedings()
        self.update_institution_relations()
        self.update_experiment_relations()
        self.update_journal_relations()

    @classmethod
    def create(
        cls,
        data,
        disable_external_push=False,
        disable_relations_update=False,
        disable_disambiguation=False,
        *args,
        **kwargs,
    ):
        LiteratureRecord.update_refs_to_conferences(data)
        data = LiteratureRecord.add_files(data)

        with db.session.begin_nested():
            LiteratureRecord.update_authors_uuids(data)
            record = super().create(data, **kwargs)

            if not disable_relations_update:
                record.update_record_relationships()

        if disable_external_push:
            LOGGER.info(
                "Record EXTERNAL PUSH disabled",
                recid=record.get("control_number"),
                uuid=str(record.id),
            )
        else:
            push_to_orcid(record)
            push_to_hal(record)
        if (
            not disable_disambiguation
            and current_app.config["FEATURE_FLAG_ENABLE_AUTHOR_DISAMBIGUATION"]
            and not data.get("deleted")
        ):
            disambiguate_authors.delay(
                str(record.id), version_id=record.model.version_id
            )
        return record

    @classmethod
    def get_es_linked_references(cls, data):
        """Return the generator of linked records from specified path for records in ES.

        Args:
            data (dict): data from which records should be extracted
            path (str): the path of the linked records.
        Yields:
            InspireRecord: the linked records.
        Examples:
            >>> data = {
                'references': [
                    {
                        'record': {
                            '$ref': 'http://localhost/literature/1'
                        }
                    }
                ]
            }
            >>>  records = LiteratureRecord.get_linked_records_from_field(
                data, "references.record")
            >>> list(records)
            [
                {
                    '$schema': 'http://localhost/schemas/records/hep.json'
                    'control_number': 1,
                    'authors': [(...)],
                    'arxiv_eprints':  [(...)],
                    'collaborations': [(...)],
                }
            ]
        """
        pids = cls._get_linked_pids_from_field(data, "record")
        if pids:
            results = LiteratureSearch.get_records_by_pids(pids, source=["_ui_display"])
            for result in results:
                try:
                    rec_data = orjson.loads(result._ui_display)
                except AttributeError:
                    LOGGER.exception(
                        "Record does not have _ui_display field!", record=result.meta.id
                    )
                    continue
                yield LiteratureRecord(rec_data)
        return []

    @staticmethod
    def update_refs_to_conferences(data):
        """Assign $ref to every publication_info which cnum we have in PIDStore"""
        for conference in data.get("publication_info", []):
            cnum = conference.get("cnum")
            if not cnum:
                continue
            pid = get_pid_for_pid("cnum", cnum, "recid")
            if not pid:
                LOGGER.info(f"CNUM: {cnum} is missing in PIDStore")
                continue
            conference["conference_record"] = get_ref_from_pid("con", pid)

    def update(
        self,
        data,
        disable_external_push=False,
        disable_relations_update=False,
        disable_disambiguation=False,
        *args,
        **kwargs,
    ):
        with db.session.begin_nested():
            LiteratureRecord.update_authors_uuids(data)
            LiteratureRecord.update_refs_to_conferences(data)
            data = self.add_files(data)
            super().update(data, *args, **kwargs)

            if not disable_relations_update:
                self.update_record_relationships()

        if disable_external_push:
            LOGGER.info(
                "Record EXTERNAL PUSH disabled",
                recid=self.get("control_number"),
                uuid=str(self.id),
            )
        else:
            push_to_orcid(self)
            push_to_hal(self)
        if (
            not disable_disambiguation
            and current_app.config["FEATURE_FLAG_ENABLE_AUTHOR_DISAMBIGUATION"]
            and not data.get("deleted")
        ):
            disambiguate_authors.delay(str(self.id), version_id=self.model.version_id)

    def get_modified_authors(self):
        previous_authors = self._previous_version.get("authors", [])
        previous_authors_by_uuid = {
            author["uuid"]: author for author in previous_authors
        }

        current_authors = self.get("authors", [])

        for author in current_authors:
            author_uuid = author["uuid"]
            if author_uuid not in previous_authors_by_uuid:
                yield author
                continue
            # we exclude reference and BAI because we don't want to run
            # disambiguation in that case.
            previous_author_with_excluded_ref = previous_authors_by_uuid[
                author_uuid
            ].copy()
            if "record" in previous_author_with_excluded_ref:
                del previous_author_with_excluded_ref["record"]
            remove_author_bai_from_id_list(previous_author_with_excluded_ref)

            author_with_excluded_ref = author.copy()
            if "record" in author_with_excluded_ref:
                del author_with_excluded_ref["record"]
            remove_author_bai_from_id_list(author_with_excluded_ref)

            if author_with_excluded_ref != previous_author_with_excluded_ref:
                yield author

    @staticmethod
    def update_authors_uuids(data):
        """Assigns a an uuid to each author of a record."""

        if "Literature" not in data["_collections"]:
            return

        for author in data.get("authors", []):
            if "uuid" not in author:
                author["uuid"] = str(uuid.uuid4())

    def get_modified_references(self):
        """Return the ids of the references diff between the latest and the
        previous version.

        The diff includes references added or deleted. Changes in a
        reference's content won't be detected.

        Also, it detects if record was deleted/un-deleted or
        superseded/un-superseded compared to the previous version and, in such
        cases, returns the full list of references.

        References not linked to any record will be ignored.

        Note: record should be committed to DB in order to correctly get the
        previous version.

        Returns:
            List: uuids of references changed from the previous version.
        """
        prev_version = self._previous_version

        changed_deleted_status = self.get("deleted", False) ^ prev_version.get(
            "deleted", False
        )

        is_superseded = (
            get_value(self, "related_records[0].relation", "") == "successor"
        )
        was_superseded = (
            get_value(prev_version, "related_records[0].relation", "") == "successor"
        )
        changed_superseded_status = is_superseded ^ was_superseded

        changed_earliest_date = (
            self.earliest_date != LiteratureRecord(prev_version).earliest_date
        )

        pids_latest = set(self.get_linked_pids_from_field("references.record"))

        pids_oldest = set(
            self._previous_version.get_linked_pids_from_field("references.record")
        )

        pids_changed = set.symmetric_difference(pids_latest, pids_oldest)

        if changed_deleted_status or changed_earliest_date or changed_superseded_status:
            return list(self.get_records_ids_by_pids(list(pids_latest | pids_changed)))

        return list(self.get_records_ids_by_pids(list(pids_changed)))

    @staticmethod
    def add_files(data):
        if not current_app.config.get("FEATURE_FLAG_ENABLE_FILES", False):
            LOGGER.info("Files are disabled")
            return data

        if data.get("deleted", False):
            LOGGER.info("Record is deleted, skipping files.")
            return data

        documents = data.pop("documents", [])
        figures = data.pop("figures", [])

        added_documents = LiteratureRecord.add_documents(documents)
        if added_documents:
            data["documents"] = added_documents

        added_figures = LiteratureRecord.add_figures(figures)
        if added_figures:
            data["figures"] = added_figures
        return data

    @staticmethod
    def _generate_and_submit_files_tasks(files, executor):
        """Generates task for processing files and submits them to executor"""
        tasks = {}
        for idx, file_data in enumerate(files):
            tasks.update(
                {
                    executor.submit(
                        LiteratureRecord.add_file,
                        current_app.app_context(),
                        **file_data,
                    ): idx
                }
            )
        return tasks

    @staticmethod
    def _update_file_entry(file_data, add_file_func):
        try:
            add_file_func(**file_data)
        except ValueError:
            LOGGER.warning(
                "Duplicated file found",
                file=file_data.get("key"),
            )

    @staticmethod
    def _process_tasks_results(tasks, files):
        try:
            for future in as_completed(
                tasks, timeout=current_app.config.get("FILES_UPLOAD_THREAD_TIMEOUT", 30)
            ):
                idx = tasks[future]
                new_file_data = future.result()
                files[idx].update(new_file_data)
        except TimeoutError:
            LOGGER.exception("Threads didn't return results on time")
            raise
        return files

    @staticmethod
    def add_documents(documents):
        builder = LiteratureBuilder()

        with ThreadPoolExecutor(
            max_workers=current_app.config.get("FILES_MAX_UPLOAD_THREADS", 5)
        ) as executor:
            tasks = LiteratureRecord._generate_and_submit_files_tasks(
                documents, executor
            )
            processed_documents = LiteratureRecord._process_tasks_results(
                tasks, documents
            )
        if processed_documents:
            for document in processed_documents:
                LiteratureRecord._update_file_entry(document, builder.add_document)
        return builder.record.get("documents")

    @staticmethod
    def add_figures(figures):
        builder = LiteratureBuilder()

        with ThreadPoolExecutor(
            max_workers=current_app.config.get("FILES_MAX_UPLOAD_THREADS", 5)
        ) as executor:
            tasks = LiteratureRecord._generate_and_submit_files_tasks(figures, executor)
            processed_figures = LiteratureRecord._process_tasks_results(tasks, figures)
        if processed_figures:
            for document in processed_figures:
                LiteratureRecord._update_file_entry(document, builder.add_figure)
        return builder.record.get("figures")

    @staticmethod
    def add_file(
        app_context,
        url,
        original_url=None,
        key=None,
        filename=None,
        fulltext=None,
        *args,
        **kwargs,
    ):
        """Adds files to s3.

        Args:
            app_context: Original app context should be passed here if running in separate thread
        """
        with app_context.app.app_context():
            result = {}
            is_s3_or_public_url = current_s3_instance.is_s3_url_with_bucket_prefix(
                url
            ) or current_s3_instance.is_public_url(url)
            if is_s3_or_public_url and not current_app.config.get(
                "UPDATE_S3_FILES_METADATA", False
            ):
                if key not in url:
                    filename = filename or key
                    key = url.split("/")[-1]
                    result.update({"key": key, "filename": filename})
                if current_s3_instance.is_s3_url(url):
                    url = current_s3_instance.get_public_url(key)
                    result.update({"url": url})

                LOGGER.info(
                    "File already on S3 - Skipping",
                    url=url,
                    key=key,
                    thread=threading.get_ident(),
                )
                return result

            data = download_file_from_url(url, check_file_size=True)
            new_key = hash_data(data)
            mimetype = magic.from_buffer(data, mime=True)
            file_data = BytesIO(data)
            filename = filename or key
            if not filename:
                filename = new_key
            if mimetype in current_app.config.get("FILES_RESTRICTED_MIMETYPES"):
                LOGGER.error(
                    "Unsupported file type - Aborting",
                    key=key,
                    mimetype=mimetype,
                    thread=threading.get_ident(),
                )
                raise UnsupportedFileError(mimetype)

            acl = current_app.config["S3_FILE_ACL"]
            if current_s3_instance.file_exists(new_key):
                LOGGER.info(
                    "Replacing file metadata",
                    key=new_key,
                    thread=threading.get_ident(),
                )
                current_s3_instance.replace_file_metadata(
                    new_key, filename, mimetype, acl
                )
            else:
                LOGGER.info(
                    "Uploading file to s3",
                    key=new_key,
                    thread=threading.get_ident(),
                )
                current_s3_instance.upload_file(
                    file_data, new_key, filename, mimetype, acl
                )
            result.update(
                {
                    "key": new_key,
                    "filename": filename,
                    "url": current_s3_instance.get_public_url(new_key),
                }
            )
            if not fulltext and mimetype == "application/pdf":
                try:
                    if is_document_scanned(data):
                        result["fulltext"] = False
                except PDFException:
                    LOGGER.info(
                        "File supposed to be PDF but PDF reader can't read it!",
                        filename=filename,
                    )
            if (
                url.startswith("http")
                and not current_s3_instance.is_s3_url(url)
                and not current_s3_instance.is_public_url(url)
                and not original_url
            ):
                result["original_url"] = url

            return result

    def get_linked_papers_if_reference_changed(self):
        """Tries to find differences in record references.

        Gets all references from  reference field and publication_info.conference_record
        field and returns records which reference changed

        Returns:
            list(uuid): List of uuids of changed references.
        """
        uuids = set(self.get_modified_references())
        uuids |= set(self.get_newest_linked_conferences_uuid())
        uuids |= set(self.get_modified_institutions_uuids())
        uuids |= set(self.get_modified_experiment_uuids())
        uuids |= set(self.get_modified_journal_uuids())
        if uuids:
            LOGGER.info(
                f"Found {len(uuids)} references changed, indexing them",
                uuid=str(self.id),
            )
            return uuids
        LOGGER.info("No references changed", uuid=str(self.id))
        return set()

    @classmethod
    def fix_entries_by_update_date(cls, before=None, after=None, max_chunk=100):
        from inspirehep.records.tasks import regenerate_author_records_table_entries

        uuids_to_regenerate = LiteratureRecord.get_recids_by_updated_datetime(
            before, after
        )
        for batch in chunker(uuids_to_regenerate, max_chunk):
            regenerate_author_records_table_entries.delay(batch)

    def remove_authors_references(self):
        for author in self.get("authors"):
            if "record" in author:
                del author["record"]
            if "curated_relation" in author:
                del author["curated_relation"]

    def serialize_for_es_with_fulltext(self):
        """Prepares proper json data for es fulltext serializer

        Returns:
            dict: Properly serialized and prepared record with full
        """
        return self.get_enhanced_es_data(serializer=self.es_fulltext_serializer)


def import_article(identifier):
    """Import a new article from arXiv or Crossref based on the identifier.

    This function attempts to parse and normalize the identifier as a valid
    arXiv id or DOI. If the identifier is valid and there is no record in
    Inspire matching the ID, it queries the arXiv/CrossRef APIs and parses
    the record to make it inspire compliant.

    Args:
        identifier(str): the ID of the record to import

    Returns:
        dict: the serialized article

    Raises:
        ExistingArticleError: if the record is already in Inspire.
        ImportArticleNotFoundError: if no article is found.
        ImportParsingError: if an error occurs while parsing the result.
        UnknownIdentifierError: if the identifier is neither "arxiv" or "doi".
    """
    if is_arxiv(identifier):
        pid_type = "arxiv"
        pid_value = normalize_arxiv(identifier)

    elif is_doi(identifier):
        pid_type = "doi"
        pid_value = normalize_doi(identifier).lower()

    else:
        raise UnknownImportIdentifierError(identifier)

    recid = get_pid_for_pid(pid_type, pid_value, provider="recid")

    if recid:
        raise ExistingArticleError(
            f"The article {identifier} already exists in Inspire", recid
        )

    importers = {"arxiv": import_arxiv, "doi": import_doi}
    importer = importers.get(pid_type, UnknownImportIdentifierError)
    article = importer(pid_value)

    if not article:
        raise ImportArticleNotFoundError(f"No article found for {identifier}")

    if pid_type == "arxiv":
        article = merge_article_with_crossref_data(article)

    return article


def merge_article_with_crossref_data(article):
    doi = get_value(article, "dois[0].value")

    if not doi:
        return article

    try:
        crossref_data = import_doi(doi)
    except (requests.exceptions.RequestException, ImportParsingError):
        LOGGER.exception("Cannot merge submission with %r,", doi)
        return article

    merged, conflicts = merge(root={}, head=article, update=crossref_data)

    try:
        validate(merged, "hep")
    except ValidationError:
        LOGGER.exception(
            "Merger returned invalid data while merging imported arxiv with crossref",
            doi=doi,
            arxiv=get_value(article, "arxiv_eprints[0].value"),
        )
        return article

    if conflicts:
        LOGGER.debug("Ignoring conflicts while enhancing submission.\n%r", conflicts)

    return merged


@backoff.on_exception(
    backoff.expo,
    requests.exceptions.RequestException,
    max_tries=2,
    max_time=15,
)
def import_arxiv(arxiv_id):
    """View for retrieving an article from arXiv.

    This endpoint is designed to be queried by inspirehep during an article
    submission, to auto-fill the submission form if the user provides an arXiv
    identifier.

    Args:
        arxiv_id: the normalized arXiv id, e.g. `0804.2273`.

    Returns:
        dict: a json object with either the parsed article

    Raises:
        requests.exceptions.RequestException: if the request doesn't succeed.
        ImportParsingError: if any error occurs during the response parsing.
    """
    url = ARXIV_URL.replace(PLACEHOLDER, arxiv_id)
    LOGGER.debug("Importing article from arxiv", arxiv=arxiv_id)

    response = requests.get(url)
    response.raise_for_status()

    if "Malformed identifier" in str(response.text):
        # arXiv will reply 200 for a non existing arXiv ID with a message error
        return {}

    try:
        parser = ArxivParser(response.text)
        return parser.parse()
    except Exception as exc:
        raise ImportParsingError(
            f"An error occurred while parsing article oai:arXiv.org:{arxiv_id}."
        ) from exc


@backoff.on_exception(
    backoff.expo,
    requests.exceptions.RequestException,
    max_tries=2,
    max_time=15,
)
def import_doi(doi):
    """View for retrieving an article from CrossRef.

    This endpoint is designed to be queried by inspirehep during an article
    submission, to auto-fill the submission form if the user provides a DOI.

    Args:
        doi: a normalized DOI id, e.g. `10.1088/1361-6633/aa5514`. The
        variable has type `path` in order to properly handle '/' in the param.

    Returns:
        dict: a json object with either the parsed article or the occurred
        error.

    Raises:
        requests.exceptions.RequestException: if the request doesn't succeed.
        ImportParsingError: if any error occurs during the response parsing.
    """
    doi = requests.utils.quote(doi, safe="")
    url = CROSSREF_URL.replace(PLACEHOLDER, doi)

    LOGGER.debug("Importing article from CrossRef", doi=doi)
    response = requests.get(url)

    if response.status_code == 404:
        return {}

    response.raise_for_status()

    try:
        parser = CrossrefParser(response.json())
        return parser.parse()
    except Exception as exc:
        raise ImportParsingError(f"An error occurred while parsing {url}") from exc
