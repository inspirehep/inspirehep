from inspirehep.records.serializers.bibtex import literature_bibtex


def test_bibtext_not_break_on_wrong_data():
    expected_result = "% Bibtex generation failed for record "
    data = {
        "titles": [
            {
                "title": "Results of the analysis of test Beam data collected at Fermilab with incident muons for the Hadronic Section of the ZEUS Barrel Calorimeter"
            }
        ],
        "authors": [
            {
                "full_name": "L. Chen, R. Imlay, S. Kartik, H.J.Kim, R. McNeil, W. Metcalf"
            }
        ],
        "document_type": ["article"],
    }
    serialized = literature_bibtex.serialize(None, data)
    assert expected_result == serialized
