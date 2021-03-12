from flask import current_app, render_template
from mock import patch

from inspirehep.mailing.api.conferences import send_conference_confirmation_email


@patch("inspirehep.mailing.api.conferences.send_email")
def test_send_conferences_confirmation_email(mock_send_email, inspire_app):
    expected_recipient = "johndoe@gmail.com"
    conference = {"control_number": "1234"}
    expected_subject = "Your conference(1234) has been successfully submitted!"
    expected_content = render_template(
        "mailing/conferences/submission_confirmation/base.html",
        conference=conference,
        host=current_app.config["SERVER_NAME"],
    )
    send_conference_confirmation_email(expected_recipient, conference)
    mock_send_email.assert_called_once_with(
        sender=current_app.config["CONFERENCES_CONFIRMATION_EMAIL_ADDRESS"],
        recipient=expected_recipient,
        subject=expected_subject,
        body=expected_content,
    )
