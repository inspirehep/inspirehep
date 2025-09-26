import re

from inspirehep.records.marshmallow.literature.bibtex import BibTexCommonSchema
from inspirehep.records.marshmallow.literature.common.collaboration import (
    CollaborationSchemaV1,
)
from inspirehep.utils import get_inspirehep_url
from lxml import etree


class OpenAIREXMLBuilder:
    """
    Build OpenAIRE Application Profile XML (oaire + datacite + dc) from an INSPIRE JSON record.
    """

    NSMAP = {
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "dc": "http://purl.org/dc/elements/1.1/",
        "dcterms": "http://purl.org/dc/terms/",
        "datacite": "http://datacite.org/schema/kernel-4",
        "oaire": "http://namespace.openaire.eu/schema/oaire/",
    }

    COAR_TYPE_MAP = {
        "bachelor thesis": "http://purl.org/coar/resource_type/c_7a1f",
        "master thesis": "http://purl.org/coar/resource_type/c_bdcc",
        "doctoral thesis": "http://purl.org/coar/resource_type/c_db06",
        "thesis": "http://purl.org/coar/resource_type/c_46ec",
        "book": "http://purl.org/coar/resource_type/c_2f33",
        "book part": "http://purl.org/coar/resource_type/c_3248",
        "conference paper": "http://purl.org/coar/resource_type/c_5794",
        "conference proceedings": "http://purl.org/coar/resource_type/c_f744",
        "journal article": "http://purl.org/coar/resource_type/c_6501",
        "metadata only access": "http://purl.org/coar/access_right/c_14cb",
        "open access": "http://purl.org/coar/access_right/c_abf2",
        "report": "http://purl.org/coar/resource_type/c_93fc",
        "research report": "http://purl.org/coar/resource_type/c_18ws",
        "preprint": "http://purl.org/coar/resource_type/c_816b",
        "research article": "http://purl.org/coar/resource_type/c_2df8fbb1",
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
        root = etree.Element(self._q("oaire", "resource"), nsmap=self.NSMAP)
        root.set(
            self._q("xsi", "schemaLocation"),
            "http://namespace.openaire.eu/schema/oaire/ https://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd",
        )

        # datacite:title
        title = self._compose_title(record.get("titles", []))
        if title:
            title_text, subtitle = title
            titles_el = etree.SubElement(root, self._q("datacite", "titles"))
            if title_text:
                etree.SubElement(
                    titles_el, self._q("datacite", "title")
                ).text = title_text
            if subtitle:
                sub_el = etree.SubElement(titles_el, self._q("datacite", "title"))
                sub_el.set("titleType", "Subtitle")
                sub_el.text = subtitle

        # datacite:creator
        creator_names = list(self._iter_creators(record))
        if creator_names:
            creators_el = etree.SubElement(root, self._q("datacite", "creators"))
            for name in creator_names:
                c_el = etree.SubElement(creators_el, self._q("datacite", "creator"))
                etree.SubElement(c_el, self._q("datacite", "creatorName")).text = name

        # datacite: alternateIdentifier
        alt_items = list(self._iter_alternate_identifiers(record))
        if alt_items:
            alts_el = etree.SubElement(
                root, self._q("datacite", "alternateIdentifiers")
            )
            for value, _type in alt_items:
                el = etree.SubElement(
                    alts_el, self._q("datacite", "alternateIdentifier")
                )
                el.set("alternateIdentifierType", _type)
                el.text = value

        # dc:language
        languages = record.get("languages", [])
        for language in languages:
            etree.SubElement(root, self._q("dc", "language")).text = language

        # datacite:date (earliest_date)
        date = record.get("earliest_date")
        if date:
            date_el = etree.SubElement(root, self._q("datacite", "date"))
            date_el.text = date
            date_el.set("dateType", "Issued")

        # oaire:resourceType
        resource_type_text = self._compute_resource_type_text(record)
        resource_type_el = etree.SubElement(root, self._q("oaire", "resourceType"))
        resource_type_el.set("resourceTypeGeneral", "literature")
        if resource_type_text:
            resource_type_el.text = resource_type_text
            uri = self.COAR_TYPE_MAP.get(resource_type_text)
            if uri:
                resource_type_el.set("uri", uri)

        # dc:description
        abstracts = record.get("abstracts", [])
        if abstracts:
            first_abstract = abstracts[0]
            description = first_abstract.get("value")
            if description:
                etree.SubElement(root, self._q("dc", "description")).text = description

        # datacite:identifier (INSPIRE URL)
        rec_id = record.get("control_number")
        if rec_id:
            identifier = etree.SubElement(root, self._q("datacite", "identifier"))
            identifier.set("identifierType", "URL")
            identifier.text = f"{INSPIREHEP_URL}/literature/{rec_id}"

        # datacite:rights
        rights_text = self._rights_from_license(record.get("license", []))
        if rights_text:
            rights_el = etree.SubElement(root, self._q("datacite", "rights"))
            rights_el.text = rights_text
            uri = self.COAR_TYPE_MAP.get(rights_text)
            if uri:
                rights_el.set("rightsURI", uri)

        # datacite:subject
        categories = record.get("inspire_categories", [])
        for category in categories:
            subjects_el = etree.SubElement(root, self._q("datacite", "subjects"))
            term = category.get("term")
            if term:
                etree.SubElement(
                    subjects_el, self._q("datacite", "subject")
                ).text = term

        # oaire:file
        documents = record.get("documents", [])
        for doc in documents:
            if (
                doc.get("fulltext") is True
                and doc.get("hidden") is False
                and doc.get("url")
            ):
                f = etree.SubElement(root, self._q("oaire", "file"))
                f.set("objectType", "fulltext")
                f.text = doc["url"]

        best_publication_info = BibTexCommonSchema.get_best_publication_info(record)
        if best_publication_info:
            # oaire:citationTitle
            title = best_publication_info.get("journal_title")
            if title:
                etree.SubElement(root, self._q("oaire", "citationTitle")).text = title

            # oaire:citationVolume
            volume = best_publication_info.get("journal_volume")
            if volume:
                etree.SubElement(root, self._q("oaire", "citationVolume")).text = volume

            # oaire:citationIssue
            issue = best_publication_info.get("journal_issue")
            if issue:
                etree.SubElement(root, self._q("oaire", "citationIssue")).text = issue

            # oaire:citationStartPage
            startPage = best_publication_info.get("page_start")
            if startPage:
                etree.SubElement(
                    root, self._q("oaire", "citationStartPage")
                ).text = startPage

            # oaire:citationEndPage
            endPage = best_publication_info.get("page_end")
            if endPage:
                etree.SubElement(
                    root, self._q("oaire", "citationEndPage")
                ).text = endPage

        # oaire:citationEdition
        editions = record.get("editions", [])
        if editions:
            first_edition = editions[0]
            if first_edition:
                etree.SubElement(
                    root, self._q("oaire", "citationEdition")
                ).text = first_edition

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
                return "bachelor thesis"
            if degree == "master":
                return "master thesis"
            if degree == "phd":
                return "doctoral thesis"
            return "thesis"

        if has_book:
            return "book"
        if has_book_chapter:
            return "book part"

        if has_conf_paper:
            return "conference paper"
        if has_proceedings:
            return "conference proceedings"
        if has_article and has_journal_title:
            return "journal article"

        if has_report:
            return "report"
        if has_note:
            return "research report"

        if has_article and has_arxiv:
            return "preprint"
        if has_article:
            return "research article"

        return None

    def _iter_creators(self, record):
        for collab in record.get("collaborations", []):
            value = collab if isinstance(collab, str) else collab.get("value", "")
            if not value:
                continue
            if re.match(CollaborationSchemaV1.REGEX_COLLABORATIONS_WITH_SUFFIX, value):
                continue
            yield value

        for author in record.get("authors", []):
            name = author.get("full_name", "")
            if name:
                yield name

    def _iter_alternate_identifiers(self, record):
        for doi in record.get("dois", []):
            doi_value = doi.get("value")
            if doi_value:
                yield doi_value, "DOI"

        for isbn in record.get("isbns", []):
            isbn_value = isbn.get("value")
            if isbn_value:
                yield isbn_value, "ISBN"

        for pid in record.get("persistent_identifiers", []):
            pid_value = pid.get("value")
            if not pid_value:
                continue
            schema = pid.get("schema", "").upper()
            if schema == "HDL":
                schema_type = "Handle"
            if schema == "URN":
                schema_type = "URN"
            yield pid_value, schema_type

        for arxiv_eprint in record.get("arxiv_eprints", []):
            arxiv_value = arxiv_eprint.get("value")
            if arxiv_value:
                yield arxiv_value, "arXiv"

    def _rights_from_license(self, licenses):
        any_cc = False
        for lic in licenses:
            name = lic.get("license", "")
            if name.upper().startswith("CC"):
                any_cc = True
                break
        return "open access" if any_cc else "metadata only access"

    def _compose_title(self, titles):
        if not titles:
            return None
        first_title = titles[0]
        title = first_title.get("title", "").strip()
        subtitle = first_title.get("subtitle", "").strip()

        if not title and not subtitle:
            return None

        return title, subtitle or None
