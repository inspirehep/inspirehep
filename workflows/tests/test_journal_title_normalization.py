from include.inspire.journal_title_normalization import get_normalized_publication_info


class TestJournalTitleNormalization:
    normalized_maps = {
        "normalized_journal_titles": {
            "Phys. Rev. Lett.": "Physical Review Letters",
            "JHEP": "Journal of High Energy Physics",
        },
        "normalized_journal_references": {
            "Phys. Rev. Lett.": "recid-123456",
        },
    }

    def test_get_normalized_publication_info_match(self):
        publication_info = {"journal_title": "Phys. Rev. Lett."}
        normalized_entry = get_normalized_publication_info(
            publication_info, self.normalized_maps
        )
        assert normalized_entry == {
            "journal_title": "Physical Review Letters",
            "journal_record": "recid-123456",
        }

    def test_get_normalized_publication_info_no_match(self):
        publication_info = {"journal_title": "Unknown Journal"}
        normalized_entry = get_normalized_publication_info(
            publication_info, self.normalized_maps
        )
        assert normalized_entry == {"journal_title": None}
