import re
from datetime import datetime
from html import escape
from itertools import chain

from inspire_utils.name import ParsedName
from inspire_utils.record import get_value, get_values_for_schema
from lxml import etree

from inspirehep.osti.config import (
    ACCEPTED_PDF_DESCRIPTIONS,
    FERMILAB_DESCRIPTIONS,
    INSPIRE_TO_OSTI_AFF_DICT,
    INSPIRE_TO_OSTI_CATEGORIES,
    OSTI_FIELDS_TO_FERMILAB_DETAILS_MAPPING,
    PRODUCT_SUBTYPE_MAPPING,
    PRODUCT_TYPE_MAPPING,
)
from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.records.api.conferences import ConferencesRecord


class OstiBuilder(object):
    def __init__(self, record):
        self.record = record
        self.root = etree.Element("records")
        self.record_xml_element = etree.SubElement(self.root, "record")
        self.url = None
        self.url_accepted = False

    def get_xml(self):
        return self.root

    def _get_conferennce_address(self, conference_data):
        address_data = []
        address_data.append(get_value(conference_data, "address.cities[0]"))
        address_data.append(get_value(conference_data, "address.state"))
        address_data.append(get_value(conference_data, "address.country_code"))
        return ", ".join(filter(None, address_data))

    def _get_conferennce_date(self, conference_data):
        opening_date = conference_data.get("opening_date")
        closing_date = conference_data.get("closing_date")
        formatted_opening_date = self._format_date(opening_date)
        formatted_closing_date = self._format_date(closing_date)
        dates = f"{formatted_opening_date}-{formatted_closing_date}"
        return dates.strip("-")

    def _format_date(self, date):
        return datetime.strptime(date, "%Y-%m-%d").strftime("%m/%d") if date else ""

    def _get_publication_date(self):
        default_date = "1990"
        date = (
            get_value(self.record, "imprints[0].date")
            or self.record.get("preprint_date")
            or get_value(self.record, "thesis_info.date")
        )

        if not date:
            if self.product_type in ["TR", "TD", "JA"]:
                return "01/01/" + default_date
            return default_date

        try:
            if len(date.split("-")) == 3:
                formated_date = datetime.strptime(date, "%Y-%m-%d").strftime("%m/%d/%Y")
            elif len(date.split("-")) == 2:
                if self.product_type in ["TR", "TD", "JA"]:
                    formated_date = datetime.strptime(date, "%Y-%m").strftime(
                        "%m/01/%Y"
                    )
                else:
                    formated_date = datetime.strptime(date, "%Y-%m").strftime("%Y %B")
            return formated_date
        except ValueError:
            return date

    def _set_url_and_acceptance(self):
        for document in self.record.get("documents"):
            if document.get("description", "").lower() in ACCEPTED_PDF_DESCRIPTIONS:
                self.url = document["url"]
                self.url_accepted = True
                break
        for url in self.record.get("urls", []):
            if url.get("description", "").lower() in ACCEPTED_PDF_DESCRIPTIONS:
                self.url = url["value"]
                self.url_accepted = True
                break
            elif url.get("description", "").lower() in FERMILAB_DESCRIPTIONS:
                self.url = url["value"]
                self.url_accepted = False
                continue
        if not self.url:
            if not self.arxiv_eprint:
                raise ValueError("No url matching conditions")
            self.url = f"https://arxiv.org/pdf/{self.arxiv_eprint}.pdf"
            self.url_accepted = False

    @staticmethod
    def add_author(parent_element, author_data):
        author_data_payload = OstiBuilder._prepare_author_xml_payload(author_data)
        for field_name in author_data_payload.keys():
            field = etree.SubElement(parent_element, field_name)
            if author_data_payload[field_name]:
                field.text = author_data_payload[field_name]

    @staticmethod
    def _prepare_author_xml_payload(author_data):
        author_parsed_name = ParsedName(author_data["full_name"])
        affiliation_name = (
            "; ".join(get_value(author_data, "affiliations.value"))
            if get_value(author_data, "affiliations.value")
            else None
        )
        orcid_list = get_values_for_schema(author_data.get("ids", []), "ORCID")
        email_list = author_data.get("emails")
        first_names = author_parsed_name.first

        payload = {
            "first_name": first_names.split(" ")[0] if first_names else None,
            "middle_name": " ".join(first_names.split(" ")[1:])
            if first_names
            else None,
            "last_name": author_parsed_name.last,
            "affiliation_name": affiliation_name,
            "orcid_id": orcid_list[0] if orcid_list else None,
            "private_email": email_list[0] if email_list else None,
        }
        return payload

    @property
    def product_type(self):
        if self.url_accepted:
            return "JA"
        reports = get_value(self.record, "report_numbers.value", [])
        pattern = f"(?<=FERMILAB\\-){'|'.join(PRODUCT_TYPE_MAPPING.keys())}(?=\\-.*)"
        product_type = "??"
        for report in reports:
            report_type_match = re.search(pattern, report)
            if report_type_match:
                matched_product_type = report_type_match.group()
                product_type = PRODUCT_TYPE_MAPPING[matched_product_type]
                break
        return product_type

    @property
    def osti_id(self):
        external_ids = get_value(self.record, "ids.external_system_identifiers", [])
        osti_id = get_values_for_schema(external_ids, "OSTI")
        return osti_id[0] if osti_id else None

    @property
    def arxiv_eprint(self):
        eprint = get_value(self.record, "arxiv_eprints[0].value")
        if eprint:
            return eprint

    def add_product_type(self):
        product_type = etree.SubElement(self.record_xml_element, "product_type")
        product_type.text = self.product_type
        if self.product_type in PRODUCT_SUBTYPE_MAPPING:
            product_type.product_subtype = PRODUCT_SUBTYPE_MAPPING[self.product_type]

    def add_authors(self):
        authors_subelement = etree.SubElement(self.record_xml_element, "authors")
        if "corporate_author" in self.record:
            authors_subelement.text = "; ".join(self.record["corporate_author"])
        authors = self.record["authors"]
        if len(authors) > 20:
            return OstiBuilder.add_author(authors_subelement, authors[0])
        for author in self.record["authors"]:
            OstiBuilder.add_author(authors_subelement, author)

    def add_site_input_code(self):
        site_input_code = etree.SubElement(self.record_xml_element, "site_input_code")
        site_input_code.text = "FNAL"

    def add_osti_id(self):
        if self.osti_id:
            etree.SubElement(self.record_xml_element, "osti_id").text = self.osti_id

    def add_revdata(self):
        if self.osti_id:
            etree.SubElement(self.record_xml_element, "revdata").text = {
                "osti_id": self.osti_id
            }

    def add_revprod(self):
        if self.osti_id:
            etree.SubElement(self.record_xml_element, "revprod").text = {
                "osti_id": self.osti_id
            }

    def add_new_tag(self):
        if not self.osti_id:
            etree.SubElement(self.record_xml_element, "new")

    def add_access_limitation(self):
        access_limitation = etree.SubElement(
            self.record_xml_element, "access_limitation"
        )
        etree.SubElement(access_limitation, "unl")

    def add_site_url(self):
        if not self.url_accepted:
            etree.SubElement(self.record_xml_element, "site_url").text = self.url

    def add_title(self):
        title = self.record["titles"][0]["title"]
        etree.SubElement(self.record_xml_element, "title").text = escape(title)

    def add_collaborations(self):
        collaboration_list = get_value(self.record, "collaborations.value", [])
        collaborations = "; ".join(collaboration_list) if collaboration_list else None
        etree.SubElement(
            self.record_xml_element, "contributor_organizations"
        ).text = collaborations

    def add_journal_type(self):
        if self.product_type == "JA":
            if self.url_accepted:
                etree.SubElement(self.record, "journal_type").text = "AM"
            else:
                etree.SubElement(self.record, "journal_type").text = "FT"

    def add_reports(self):
        report_element = etree.SubElement(self.record_xml_element, "report_nos")
        reports_list = get_value(self.record, "report_numbers.value", [])
        if self.arxiv_eprint:
            reports_list.append(self.arxiv_eprint)
        if reports_list:
            report_element.text = "; ".join(reports_list)

    def add_fermilab_details(self):
        for field, fermilab_value in OSTI_FIELDS_TO_FERMILAB_DETAILS_MAPPING.items():
            etree.SubElement(self.record_xml_element, field).text = fermilab_value

    def add_description(self):
        abstract_element = etree.SubElement(self.record_xml_element, "description")
        abstracts = self.record.get("abstracts")
        if not abstracts:
            return
        abstract = abstracts[0]["value"]
        if len(abstract) > 4990:
            abstract = abstract[:4990] + "..."
        abstract_element.text = abstract

    def add_affiliations(self):
        affiliations_osti_format = {INSPIRE_TO_OSTI_AFF_DICT["Fermilab"]}
        for affiliation in chain.from_iterable(
            get_value(self.record, "authors.affiliations.value")
        ):
            if INSPIRE_TO_OSTI_AFF_DICT.get(affiliation):
                affiliations_osti_format.add(INSPIRE_TO_OSTI_AFF_DICT[affiliation])
        etree.SubElement(
            self.record_xml_element, "originating_research_org"
        ).text = ", ".join(affiliations_osti_format)

    def add_journal(self):
        publication_info_required_fields = {
            "journal_name": get_value(self.record, "publication_info[0].journal_title"),
            "journal_volume": get_value(self.record, "publication_info[0].volume"),
            "journal_issue": get_value(
                self.record, "publication_info[0].journal_issue"
            ),
            "pages": get_value(self.record, "publication_info[0].artid")
            or get_value(self.record, "publication_info[0].pages"),
            "doi": get_value(self.record, "dois[0].value"),
        }

        if (
            not publication_info_required_fields["journal_name"]
            and self.product_type == "JA"
        ):
            etree.SubElement(self.record_xml_element, "journal_name").text = "TBD"
            return

        for (
            publication_info_field,
            publication_info_value,
        ) in publication_info_required_fields.items():
            etree.SubElement(
                self.record_xml_element, publication_info_field
            ).text = publication_info_value

    def add_conference_information(self):
        conference_element = etree.SubElement(
            self.record_xml_element, "conference_information"
        )
        if not self.product_type == "CO":
            return
        conference_record_ref = get_value(
            self.record, "publication_info.conference_record.$ref"
        )
        if not conference_record_ref:
            return
        conference_record = ConferencesRecord.get_record_by_pid_value(
            PidStoreBase.get_pid_from_record_uri(conference_record_ref[0])[1]
        )
        conference_address = self._get_conferennce_address(conference_record)
        conference_dates = self._get_conferennce_date(conference_record)
        conference_note = f"{conference_address}, {conference_dates}".strip(",")
        conference_element.text = conference_note

    def add_oai_identifier(self):
        etree.SubElement(
            self.record_xml_element, "other_identifying_nos"
        ).text = f"oai:inspirehep.net:{self.record['control_number']}"

    def add_date(self):
        date = self._get_publication_date()
        etree.SubElement(self.record_xml_element, "publication_date").text = date

    def add_language(self):
        language = get_value(self.record, "languages[0]") or "English"
        etree.SubElement(self.record_xml_element, "language").text = language

    def add_subject_categories(self):
        subject_categories_element = etree.SubElement(
            self.record_xml_element, "subject_category_code"
        )
        osti_categories = []
        for inspire_category in self.record["inspire_categories"]:
            if inspire_category["term"] in INSPIRE_TO_OSTI_CATEGORIES:
                osti_categories.append(
                    INSPIRE_TO_OSTI_CATEGORIES[inspire_category["term"]]
                )
        if osti_categories:
            subject_categories_element.text = "; ".join(osti_categories)

    def add_released_date(self):
        etree.SubElement(
            self.record_xml_element, "released_date"
        ).text = datetime.now().strftime("%m/%d/%Y")

    def build_osti_xml(self):
        self._set_url_and_acceptance()
        self.add_osti_id()
        self.add_revdata()
        self.add_revprod()
        self.add_new_tag()
        self.add_site_input_code()
        self.add_journal_type()
        self.add_product_type()
        self.add_access_limitation()
        self.add_site_url()
        self.add_title()
        self.add_authors()
        self.add_collaborations()
        self.add_reports()
        self.add_fermilab_details()
        self.add_description()
        self.add_affiliations()
        self.add_journal()
        self.add_conference_information()
        self.add_oai_identifier()
        self.add_date()
        self.add_date()
        self.add_language()
        self.add_subject_categories()
        self.add_released_date()
