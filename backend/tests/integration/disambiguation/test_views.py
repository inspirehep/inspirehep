import json

from flask import current_app
from helpers.utils import create_user_and_token
from mock import patch


@patch("inspirehep.disambiguation.views.disambiguate_signatures")
def test_view_disambiguate(disambiguate_signatures_mock, inspire_app, override_config):
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": 374836,
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                }
            ],
            "authors": [{"author_id": 100, "has_claims": True}],
        }
    ]
    config = {"FEATURE_FLAG_ENABLE_DISAMBIGUATION": True}
    with override_config(**config), inspire_app.test_client() as client:
        response = client.post(
            "/disambiguation",
            content_type="application/json",
            data=json.dumps({"clusters": clusters}),
            headers=headers,
        )
    expected_message = "Disambiguation started."
    expected_status_code = 200

    result_message = response.json["message"]
    result_status_code = response.status_code

    assert expected_status_code == result_status_code
    assert expected_message == result_message
    disambiguate_signatures_mock.apply_async.assert_called_with(
        queue="disambiguation", kwargs={"clusters": clusters}
    )


@patch("inspirehep.disambiguation.views.disambiguate_signatures")
def test_view_disambiguate_with_disambiguation_disabled(
    disambiguate_signatures_mock, inspire_app
):
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": 374836,
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                }
            ],
            "authors": [{"author_id": 100, "has_claims": True}],
        }
    ]
    with inspire_app.test_client() as client:
        response = client.post(
            "/disambiguation",
            content_type="application/json",
            data=json.dumps({"clusters": clusters}),
            headers=headers,
        )
    expected_message = "Disambiguation feature is disabled."
    expected_status_code = 200

    result_message = response.json["message"]
    result_status_code = response.status_code

    assert expected_status_code == result_status_code
    assert expected_message == result_message
    disambiguate_signatures_mock.apply_async.assert_not_called()


@patch("inspirehep.disambiguation.views.disambiguate_signatures")
def test_view_disambiguate_requires_authentication(
    disambiguate_signatures_mock, inspire_app
):
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": 374836,
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                }
            ],
            "authors": [{"author_id": 100, "has_claims": True}],
        }
    ]
    with inspire_app.test_client() as client:
        response = client.post(
            "/disambiguation",
            content_type="application/json",
            data=json.dumps({"wrong key": clusters}),
        )
    expected_status_code = 401
    result_status_code = response.status_code

    assert expected_status_code == result_status_code


def test_view_disambiguate_with_missing_data(inspire_app):
    token = create_user_and_token()
    headers = {"Authorization": "BEARER " + token.access_token}
    clusters = [{"authors": [{"author_id": 100, "has_claims": True}]}]
    with inspire_app.test_client() as client:
        response = client.post(
            "/disambiguation",
            content_type="application/json",
            data=json.dumps({"clusters": clusters}),
            headers=headers,
        )
    expected_message = "Validation Error."
    expected_status_code = 400
    expected_errors = {
        "clusters": {"0": {"signatures": ["Missing data for required field."]}}
    }

    result_message = response.json["message"]
    result_status_code = response.status_code
    result_errors = response.json["errors"]

    assert expected_status_code == result_status_code
    assert expected_message == result_message
    assert expected_errors == result_errors
