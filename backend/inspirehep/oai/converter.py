import re

from inspire_utils.record import get_value
from inspirehep.records.marshmallow.literature.bibtex import BibTexCommonSchema
from inspirehep.records.marshmallow.literature.common.collaboration import (
    CollaborationSchemaV1,
)
from inspirehep.utils import get_inspirehep_url
from lxml import etree

RDF = "rdf"
XSI = "xsi"
DC = "dc"
DCTERMS = "dcterms"
DATACITE = "datacite"
OAIRE = "oaire"

BACHELOR_THESIS = "bachelor thesis"
MASTER_THESIS = "master thesis"
DOCTORAL_THESIS = "doctoral thesis"
THESIS = "thesis"
BOOK = "book"
BOOK_PART = "book part"
CONFERENCE_PAPER = "conference paper"
CONFERENCE_PROCEEDINGS = "conference proceedings"
JOURNAL_ARTICLE = "journal article"
METADATA_ONLY_ACCESS = "metadata only access"
OPEN_ACCESS = "open access"
REPORT = "report"
RESEARCH_REPORT = "research report"
PREPRINT = "preprint"
RESEARCH_ARTICLE = "research article"


class OpenAIREXMLConverter:
    """
    Convert INSPIRE JSON record to OpenAIRE Application Profile XML (oaire + datacite + dc).
    """

    NSMAP = {
        RDF: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        XSI: "http://www.w3.org/2001/XMLSchema-instance",
        DC: "http://purl.org/dc/elements/1.1/",
        DCTERMS: "http://purl.org/dc/terms/",
        DATACITE: "http://datacite.org/schema/kernel-4",
        OAIRE: "http://namespace.openaire.eu/schema/oaire/",
    }

    COAR_TYPE_MAP = {
        BACHELOR_THESIS: "http://purl.org/coar/resource_type/c_7a1f",
        MASTER_THESIS: "http://purl.org/coar/resource_type/c_bdcc",
        DOCTORAL_THESIS: "http://purl.org/coar/resource_type/c_db06",
        THESIS: "http://purl.org/coar/resource_type/c_46ec",
        BOOK: "http://purl.org/coar/resource_type/c_2f33",
        BOOK_PART: "http://purl.org/coar/resource_type/c_3248",
        CONFERENCE_PAPER: "http://purl.org/coar/resource_type/c_5794",
        CONFERENCE_PROCEEDINGS: "http://purl.org/coar/resource_type/c_f744",
        JOURNAL_ARTICLE: "http://purl.org/coar/resource_type/c_6501",
        METADATA_ONLY_ACCESS: "http://purl.org/coar/access_right/c_14cb",
        OPEN_ACCESS: "http://purl.org/coar/access_right/c_abf2",
        REPORT: "http://purl.org/coar/resource_type/c_93fc",
        RESEARCH_REPORT: "http://purl.org/coar/resource_type/c_18ws",
        PREPRINT: "http://purl.org/coar/resource_type/c_816b",
        RESEARCH_ARTICLE: "http://purl.org/coar/resource_type/c_2df8fbb1",
    }

    def _q(self, prefix, tag):
        return f"{{{self.NSMAP[prefix]}}}{tag}"

    def to_string(self, record):
        el = self.get_xml(record)
        return etree.tostring(
            el, pretty_print=True, xml_declaration=True, encoding="UTF-8"
        ).decode("utf-8")

    def get_xml(self, record):
        INSPIREHEP_URL = get_inspirehep_url()
        root = etree.Element(self._q(OAIRE, "resource"), nsmap=self.NSMAP)
        root.set(
            self._q("xsi", "schemaLocation"),
            "http://namespace.openaire.eu/schema/oaire/ https://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd",
        )

        # datacite:title
        title = self._compose_title(record)
        if title:
            title_text, subtitle = title
            titles_el = etree.SubElement(root, self._q(DATACITE, "titles"))
            if title_text:
                etree.SubElement(
                    titles_el, self._q(DATACITE, "title")
                ).text = title_text
            if subtitle:
                sub_el = etree.SubElement(titles_el, self._q(DATACITE, "title"))
                sub_el.set("titleType", "Subtitle")
                sub_el.text = subtitle

        # datacite:creator
        creator_names = list(self._iter_creators(record))
        if creator_names:
            creators_el = etree.SubElement(root, self._q(DATACITE, "creators"))
            for name in creator_names:
                c_el = etree.SubElement(creators_el, self._q(DATACITE, "creator"))
                etree.SubElement(c_el, self._q(DATACITE, "creatorName")).text = name

        # datacite: alternateIdentifier
        alt_items = list(self._iter_alternate_identifiers(record))
        if alt_items:
            alts_el = etree.SubElement(root, self._q(DATACITE, "alternateIdentifiers"))
            for value, _type in alt_items:
                el = etree.SubElement(alts_el, self._q(DATACITE, "alternateIdentifier"))
                el.set("alternateIdentifierType", _type)
                el.text = value

        # dc:language
        languages = record.get("languages", [])
        for language in languages:
            etree.SubElement(root, self._q("dc", "language")).text = language

        # datacite:date (earliest_date)
        date = record.get("earliest_date")
        if date:
            date_el = etree.SubElement(root, self._q(DATACITE, "date"))
            date_el.text = date
            date_el.set("dateType", "Issued")

        # oaire:resourceType
        resource_type_text = self._compute_resource_type_text(record)
        resource_type_el = etree.SubElement(root, self._q(OAIRE, "resourceType"))
        resource_type_el.set("resourceTypeGeneral", "literature")
        if resource_type_text:
            resource_type_el.text = resource_type_text
            uri = self.COAR_TYPE_MAP.get(resource_type_text)
            if uri:
                resource_type_el.set("uri", uri)

        # dc:description
        description = get_value(record, "abstracts[0].value")
        if description:
            etree.SubElement(root, self._q(DC, "description")).text = description

        # datacite:identifier (INSPIRE URL)
        rec_id = record.get("control_number")
        if rec_id:
            identifier = etree.SubElement(root, self._q(DATACITE, "identifier"))
            identifier.set("identifierType", "URL")
            identifier.text = f"{INSPIREHEP_URL}/literature/{rec_id}"

        # datacite:rights
        rights_text = self._rights_from_license(record)
        if rights_text:
            rights_el = etree.SubElement(root, self._q(DATACITE, "rights"))
            rights_el.text = rights_text
            uri = self.COAR_TYPE_MAP.get(rights_text)
            if uri:
                rights_el.set("rightsURI", uri)

        # datacite:subject
        terms = get_value(record, "inspire_categories.term", [])
        if terms:
            subjects_el = etree.SubElement(root, self._q(DATACITE, "subjects"))
            for term in terms:
                etree.SubElement(subjects_el, self._q(DATACITE, "subject")).text = term

        # oaire:file
        documents = record.get("documents", [])
        for doc in documents:
            if (
                doc.get("fulltext") is True
                and doc.get("hidden") is False
                and doc.get("url")
            ):
                f = etree.SubElement(root, self._q(OAIRE, "file"))
                f.set("objectType", "fulltext")
                f.text = doc["url"]

        best_publication_info = BibTexCommonSchema.get_best_publication_info(record)
        if best_publication_info:
            # oaire:citationTitle
            title = best_publication_info.get("journal_title")
            if title:
                etree.SubElement(root, self._q(OAIRE, "citationTitle")).text = title

            # oaire:citationVolume
            volume = best_publication_info.get("journal_volume")
            if volume:
                etree.SubElement(root, self._q(OAIRE, "citationVolume")).text = volume

            # oaire:citationIssue
            issue = best_publication_info.get("journal_issue")
            if issue:
                etree.SubElement(root, self._q(OAIRE, "citationIssue")).text = issue

            # oaire:citationStartPage
            startPage = best_publication_info.get("page_start")
            if startPage:
                etree.SubElement(
                    root, self._q(OAIRE, "citationStartPage")
                ).text = startPage

            # oaire:citationEndPage
            endPage = best_publication_info.get("page_end")
            if endPage:
                etree.SubElement(root, self._q(OAIRE, "citationEndPage")).text = endPage

        # oaire:citationEdition
        edition = get_value(record, "editions[0]")
        if edition:
            etree.SubElement(root, self._q(OAIRE, "citationEdition")).text = edition

        return root

    def _compute_resource_type_text(self, record):
        doc_types = record.get("document_type", [])
        thesis_info = record.get("thesis_info", {})
        degree = thesis_info.get("degree_type", "").strip().lower()

        has_article = "article" in doc_types
        has_thesis = "thesis" in doc_types
        has_book = "book" in doc_types
        has_book_chapter = "book chapter" in doc_types
        has_conf_paper = "conference paper" in doc_types
        has_proceedings = "proceedings" in doc_types
        has_report = "report" in doc_types or "activity_report" in doc_types
        has_note = "note" in doc_types

        pub_infos = record.get("publication_info", [])
        has_journal_title = any(bool(pi.get("journal_title")) for pi in pub_infos)

        has_arxiv = bool(record.get("arxiv_eprints"))

        if has_thesis:
            if degree == "bachelor":
                return BACHELOR_THESIS
            if degree == "master":
                return MASTER_THESIS
            if degree == "phd":
                return DOCTORAL_THESIS
            return THESIS

        if has_book:
            return BOOK
        if has_book_chapter:
            return BOOK_PART

        if has_conf_paper:
            return CONFERENCE_PAPER
        if has_proceedings:
            return CONFERENCE_PROCEEDINGS
        if has_article and has_journal_title:
            return JOURNAL_ARTICLE

        if has_report:
            return REPORT
        if has_note:
            return RESEARCH_REPORT

        if has_article and has_arxiv:
            return PREPRINT
        if has_article:
            return RESEARCH_ARTICLE

        return None

    def _iter_creators(self, record):
        for collab in record.get("collaborations", []):
            value = collab if isinstance(collab, str) else collab.get("value", "")
            if not value:
                continue
            if re.match(CollaborationSchemaV1.REGEX_COLLABORATIONS_WITH_SUFFIX, value):
                continue
            yield value

        yield from get_value(record, "authors.full_name", [])

    def _iter_alternate_identifiers(self, record):
        for doi in get_value(record, "dois.value", []):
            if doi:
                yield doi, "DOI"

        for isbn in get_value(record, "isbns.value", []) or []:
            if isbn:
                yield isbn, "ISBN"

        for pid_value, schema in zip(
            get_value(record, "persistent_identifiers.value", []),
            get_value(record, "persistent_identifiers.schema", []),
            strict=False,
        ):
            schema_type = {"HDL": "Handle", "URN": "URN"}.get(schema.upper())
            yield pid_value, schema_type

        for arxiv in get_value(record, "arxiv_eprints.value", []):
            if arxiv:
                yield arxiv, "arXiv"

    def _rights_from_license(self, record):
        licenses = get_value(record, "license.license", [])
        return (
            "open access"
            if any((lic or "").upper().startswith("CC") for lic in licenses)
            else "metadata only access"
        )

    def _compose_title(self, record):
        title = get_value(record, "titles[0].title")
        subtitle = get_value(record, "titles[0].subtitle")
        return title, subtitle or None
