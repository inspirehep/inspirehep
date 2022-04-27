import mock
import orjson
import pytest


@mock.patch(
    "inspirehep.refextract.utils.create_journal_dict",
    return_value={
        "COMMUNICATIONS IN ASTEROSEISMOLOGY": "Commun.Asteros.",
        "PHYS REV": "Phys.Rev.",
        "PHYSICAL REVIEW": "Phys.Rev.",
        "PHYS REV LETT": "Phys.Rev.Lett.",
        "JINST": "JINST",
        "JOURNAL OF INSTRUMENTATION": "JINST",
        "SENS ACTUATORS B": "Sens.Actuators B",
        "SENSORS AND ACTUATORS B: CHEMICAL": "Sens.Actuators B",
        "PHYS SCRIPTA": "Phys.Scripta",
        "PHYSICA SCRIPTA": "Phys.Scripta",
        "BULL CALCUTTA MATH SOC": "Bull.Calcutta Math.Soc.",
        "BULLETIN OF THE CALCUTTA MATHEMATICAL SOCIETY": "Bull.Calcutta Math.Soc.",
        "QUANTUM MACHINE INTELLIGENCE": "Quantum Machine Intelligence",
    },
)
def test_extract_journal_info(
    mock_create_journal_dict, inspire_app, clean_redis_journal_dict
):
    wf_data = {
        "publication_info": [{"pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970"}]
    }

    headers = {
        "content-type": "application/json",
    }
    with inspire_app.test_client() as client:
        response = client.post(
            "/refextract/extract_journal_info",
            headers=headers,
            data=orjson.dumps({"publication_info": wf_data["publication_info"]}),
        )
    assert response.status_code == 200
    assert "extracted_publication_infos" in response.json
    assert len(response.json["extracted_publication_infos"]) == 1


@mock.patch(
    "inspirehep.refextract.utils.create_journal_dict",
    return_value={"COMMUNICATIONS IN ASTEROSEISMOLOGY": "Commun.Asteros."},
)
@mock.patch(
    "inspirehep.refextract.views.extract_journal_reference", side_effect=TimeoutError
)
def test_extract_journal_info_when_timeout_from_refextract(
    mock_extract_refs, mock_create_journal_dict, inspire_app, clean_redis_journal_dict
):
    wf_data = {
        "publication_info": [{"pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970"}]
    }

    headers = {
        "content-type": "application/json",
    }
    with inspire_app.test_client() as client:
        response = client.post(
            "/refextract/extract_journal_info",
            headers=headers,
            data=orjson.dumps({"publication_info": wf_data["publication_info"]}),
        )
    assert response.status_code == 500
    assert {"message": "Can not extract references due to timeout"} == response.json


@mock.patch(
    "inspirehep.refextract.utils.create_journal_dict",
    return_value={
        "COMMUNICATIONS IN ASTEROSEISMOLOGY": "Commun.Asteros.",
        "PHYS REV": "Phys.Rev.",
        "PHYSICAL REVIEW": "Phys.Rev.",
        "PHYS REV LETT": "Phys.Rev.Lett.",
        "JINST": "JINST",
        "JOURNAL OF INSTRUMENTATION": "JINST",
        "SENS ACTUATORS B": "Sens.Actuators B",
        "SENSORS AND ACTUATORS B: CHEMICAL": "Sens.Actuators B",
        "PHYS SCRIPTA": "Phys.Scripta",
        "PHYSICA SCRIPTA": "Phys.Scripta",
        "BULL CALCUTTA MATH SOC": "Bull.Calcutta Math.Soc.",
        "BULLETIN OF THE CALCUTTA MATHEMATICAL SOCIETY": "Bull.Calcutta Math.Soc.",
        "QUANTUM MACHINE INTELLIGENCE": "Quantum Machine Intelligence",
    },
)
def test_extract_journal_info_uses_journal_dict_from_redis(
    mock_create_journal_dict, inspire_app, clean_redis_journal_dict
):
    wf_data = {
        "publication_info": [
            {"pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970"},
            {"pubinfo_freetext": "Phys.Rev.Lett. 122 (1962) 965-970"},
        ]
    }

    headers = {
        "content-type": "application/json",
    }
    with inspire_app.test_client() as client:
        response = client.post(
            "/refextract/extract_journal_info",
            headers=headers,
            data=orjson.dumps({"publication_info": wf_data["publication_info"]}),
        )
    assert response.status_code == 200
    assert "extracted_publication_infos" in response.json
    assert len(response.json["extracted_publication_infos"]) == 2
    assert mock_create_journal_dict.called_once()


@mock.patch(
    "inspirehep.refextract.utils.create_journal_dict",
    return_value={
        "COMMUNICATIONS IN ASTEROSEISMOLOGY": "Commun.Asteros.",
        "PHYS REV": "Phys.Rev.",
        "PHYSICAL REVIEW": "Phys.Rev.",
        "PHYS REV LETT": "Phys.Rev.Lett.",
        "JINST": "JINST",
        "JOURNAL OF INSTRUMENTATION": "JINST",
        "SENS ACTUATORS B": "Sens.Actuators B",
        "SENSORS AND ACTUATORS B: CHEMICAL": "Sens.Actuators B",
        "PHYS SCRIPTA": "Phys.Scripta",
        "PHYSICA SCRIPTA": "Phys.Scripta",
        "BULL CALCUTTA MATH SOC": "Bull.Calcutta Math.Soc.",
        "BULLETIN OF THE CALCUTTA MATHEMATICAL SOCIETY": "Bull.Calcutta Math.Soc.",
        "QUANTUM MACHINE INTELLIGENCE": "Quantum Machine Intelligence",
    },
)
def test_extract_extract_references_from_text(
    mock_create_journal_dict, inspire_app, clean_redis_journal_dict
):
    headers = {
        "content-type": "application/json",
    }
    text = u"Iskra Ł W et al 2017 Acta Phys. Pol. B 48 581"
    with inspire_app.test_client() as client:
        response = client.post(
            "/refextract/extract_references_from_text",
            headers=headers,
            data=orjson.dumps({"text": text}),
        )
    assert response.status_code == 200
    assert "extracted_references" in response.json
    assert len(response.json["extracted_references"]) == 1
    assert "author" in response.json["extracted_references"][0]
    assert "misc" in response.json["extracted_references"][0]
    assert "year" in response.json["extracted_references"][0]


@mock.patch(
    "inspirehep.refextract.utils.create_journal_dict",
    return_value={"COMMUNICATIONS IN ASTEROSEISMOLOGY": "Commun.Asteros."},
)
@mock.patch(
    "inspirehep.refextract.views.extract_references_from_string",
    side_effect=TimeoutError,
)
def test_extract_references_from_text_when_timeout_from_refextract(
    mock_extract_refs, mock_create_journal_dict, inspire_app, clean_redis_journal_dict
):
    headers = {
        "content-type": "application/json",
    }
    text = u"Iskra Ł W et al 2017 Acta Phys. Pol. B 48 581"
    with inspire_app.test_client() as client:
        response = client.post(
            "/refextract/extract_references_from_text",
            headers=headers,
            data=orjson.dumps({"text": text}),
        )
    assert response.status_code == 500
    assert {"message": "Can not extract references due to timeout"} == response.json


@pytest.mark.vcr()
@mock.patch(
    "inspirehep.refextract.utils.create_journal_dict",
    return_value={
        "COMMUNICATIONS IN ASTEROSEISMOLOGY": "Commun.Asteros.",
        "PHYS REV": "Phys.Rev.",
        "PHYSICAL REVIEW": "Phys.Rev.",
        "PHYS REV LETT": "Phys.Rev.Lett.",
        "JINST": "JINST",
        "JOURNAL OF INSTRUMENTATION": "JINST",
        "SENS ACTUATORS B": "Sens.Actuators B",
        "SENSORS AND ACTUATORS B: CHEMICAL": "Sens.Actuators B",
        "PHYS SCRIPTA": "Phys.Scripta",
        "PHYSICA SCRIPTA": "Phys.Scripta",
        "BULL CALCUTTA MATH SOC": "Bull.Calcutta Math.Soc.",
        "BULLETIN OF THE CALCUTTA MATHEMATICAL SOCIETY": "Bull.Calcutta Math.Soc.",
        "QUANTUM MACHINE INTELLIGENCE": "Quantum Machine Intelligence",
    },
)
def test_extract_extract_references_from_url(
    mock_create_journal_dict, inspire_app, clean_redis_journal_dict
):
    headers = {
        "content-type": "application/json",
    }
    url = "https://inspirehep.net/files/33ea6e86a7bfb4cab4734ed5c14d4529"
    with inspire_app.test_client() as client:
        response = client.post(
            "/refextract/extract_references_from_url",
            headers=headers,
            data=orjson.dumps({"file_url": url}),
        )
    assert response.status_code == 200
    assert "extracted_references" in response.json
    assert len(response.json["extracted_references"]) == 2
