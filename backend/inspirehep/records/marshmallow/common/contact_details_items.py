from marshmallow import Schema, fields


class ContactDetailsItemWithoutEmail(Schema):
    class Meta:
        exclude = ["email"]

    name = fields.Raw()
    record = fields.Raw()
