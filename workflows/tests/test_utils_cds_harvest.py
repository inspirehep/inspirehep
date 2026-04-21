from include.utils.cds_harvest import (
    build_records,
    extract_marcxml_record,
)


class TestCDSHarvestUtils:
    def test_extract_marcxml_record(self):
        xml_record = """
        <OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
          <ListRecords>
            <record>
              <metadata>
                <record xmlns="http://www.loc.gov/MARC21/slim">
                  <controlfield tag="001">123</controlfield>
                </record>
              </metadata>
            </record>
          </ListRecords>
        </OAI-PMH>
        """

        result = extract_marcxml_record(xml_record)

        assert '<controlfield tag="001">123</controlfield>' in result

    def test_build_records(self):
        xml_records = [
            """
            <OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
              <ListRecords>
                <record>
                  <metadata>
                    <record xmlns="http://www.loc.gov/MARC21/slim">
                      <controlfield tag="001">123</controlfield>
                    </record>
                  </metadata>
                </record>
              </ListRecords>
            </OAI-PMH>
            """
        ]

        parsed_records, failed_build_records = build_records(xml_records, "12345")

        assert len(parsed_records) == 1
        assert len(failed_build_records) == 0
        assert parsed_records[0]["acquisition_source"]["source"] == "CDS"
        assert parsed_records[0]["acquisition_source"]["method"] == "hepcrawl"
        assert parsed_records[0]["acquisition_source"]["submission_number"] == "12345"
        assert parsed_records[0]["external_system_identifiers"] == [
            {"schema": "CDS", "value": "123"}
        ]
        for document in parsed_records[0].get("documents", []):
            assert document["original_url"] == document["url"]

    def test_build_records_bad(self):
        xml_records = [
            """
            <OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">
              <ListRecords>
                <record-bad>
                  <metadata>
                    <record xmlns="http://www.loc.gov/MARC21/slim">
                      <controlfield tag="001">123</controlfield>
                    </record-bad>
                  </metadata>
                </record>
              </ListRecords>
            </OAI-PMH>
            """
        ]

        parsed_records, failed_build_records = build_records(xml_records, "12345")

        assert len(parsed_records) == 0
        assert len(failed_build_records) == 1
