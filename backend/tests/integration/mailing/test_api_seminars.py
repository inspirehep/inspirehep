from flask import current_app, render_template
from mock import patch

from inspirehep.mailing.api.seminars import send_seminar_confirmation_email
from inspirehep.utils import get_inspirehep_url


@patch("inspirehep.mailing.api.seminars.send_email")
def test_send_seminar_confirmation_email(mock_send_email, base_app, db, es_clear):
    expected_recipient = "johndoe@gmail.com"
    seminar = {"control_number": "1234"}
    expected_subject = "Your seminar (1234) has been successfully submitted!"
    host = get_inspirehep_url()
    expected_content = render_template(
        "mailing/seminars/confirmation_new.html",
        seminar_url=f"{host}/seminars/1234",
        seminar_edit_url=f"{host}/submissions/seminars/1234",
    )
    send_seminar_confirmation_email(expected_recipient, seminar)
    mock_send_email.assert_called_once_with(
        sender=current_app.config["SEMINARS_CONFIRMATION_EMAIL_ADDRESS"],
        recipient=expected_recipient,
        subject=expected_subject,
        body=expected_content,
    )
