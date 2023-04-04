import structlog
from flask import Blueprint
from webargs import fields
from webargs.flaskparser import FlaskParser

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.serializers import jsonify
from inspirehep.snow.api import InspireSnow
from inspirehep.snow.errors import CreateTicketException, EditTicketException

blueprint = Blueprint("inspirehep_tickets", __name__, url_prefix="/tickets")
LOGGER = structlog.getLogger()
parser = FlaskParser()


@blueprint.route("create", methods=["POST"])
@parser.use_args(
    {
        "functional_category": fields.String(required=True),
        "recid": fields.String(required=False),
        "subject": fields.String(required=True),
        "description": fields.String(required=False),
        "caller_email": fields.String(required=False),
    }
)
@login_required_with_roles([Roles.superuser.value])
def create_ticket(args):
    snow_instance = InspireSnow()
    try:
        ticket = snow_instance.create_inspire_ticket(
            user_email=args.get("caller_email"),
            functional_category=args.get("functional_category"),
            subject=args.get("subject"),
            description=args.get("description"),
        )
        return jsonify({"ticket_id": ticket}), 200
    except (CreateTicketException, EditTicketException) as e:
        LOGGER.warning("Can't create SNOW ticket", exception=str(e))
        return jsonify({"message": "Can't create SNOW ticket!"}), 500


@blueprint.route("create-with-template", methods=["POST"])
@parser.use_args(
    {
        "functional_category": fields.String(required=True),
        "template": fields.String(required=True),
        "subject": fields.String(required=True),
        "recid": fields.String(required=False),
        "caller_email": fields.String(required=False),
        "template_context": fields.Dict(required=False),
    }
)
@login_required_with_roles([Roles.superuser.value])
def create_ticket_with_template(args):
    snow_instance = InspireSnow()
    try:
        template_path = f"rt/{args['template']}.html"
        ticket = snow_instance.create_inspire_ticket_with_template(
            template_context=args.get("template_context"),
            template_path=template_path,
            user_email=args.get("caller_email"),
            functional_category=args.get("functional_category"),
            subject=args.get("subject"),
        )
        return jsonify({"ticket_id": ticket}), 200
    except (CreateTicketException, EditTicketException) as e:
        LOGGER.warning("Can't create SNOW ticket", exception=str(e))
        return jsonify({"message": "Can't create SNOW ticket!"}), 500


@blueprint.route("reply-with-template", methods=["POST"])
@parser.use_args(
    {
        "ticket_id": fields.String(required=True),
        "template": fields.String(),
        "template_context": fields.Dict(required=False),
    }
)
@login_required_with_roles([Roles.superuser.value])
def reply_ticket_with_template(args):
    snow_instance = InspireSnow()
    try:
        template_path = f"rt/{args['template']}.html"
        snow_instance.reply_ticket_with_template(
            args["ticket_id"], template_path, args["template_context"]
        )
        return jsonify({"message": "Ticket was updated with the reply"}), 200
    except EditTicketException as e:
        LOGGER.warning("Can't reply SNOW ticket", exception=str(e))
        return jsonify({"message": "Can't reply SNOW ticket!"}), 500


@blueprint.route("reply", methods=["POST"])
@parser.use_args(
    {
        "ticket_id": fields.String(required=True),
        "reply_message": fields.String(required=True),
    }
)
@login_required_with_roles([Roles.superuser.value])
def reply_ticket(args):
    snow_instance = InspireSnow()
    try:
        snow_instance.reply_ticket(args["ticket_id"], args["reply_message"])
        return jsonify({"message": "Ticket was updated with the reply"}), 200
    except EditTicketException as e:
        LOGGER.warning("Can't reply SNOW ticket", exception=str(e))
        return jsonify({"message": "Can't reply SNOW ticket!"}), 500


@blueprint.route("resolve", methods=["POST"])
@parser.use_args(
    {
        "ticket_id": fields.String(required=True),
    }
)
@login_required_with_roles([Roles.superuser.value])
def resolve_ticket(args):
    snow_instance = InspireSnow()
    try:
        snow_instance.resolve_ticket(ticket_id=args["ticket_id"])
        return jsonify({"message": "Ticket resolved"}), 200
    except (CreateTicketException, EditTicketException) as e:
        LOGGER.warning("Can't resolve SNOW ticket", exception=str(e))
        return jsonify({"message": "Can't resolve SNOW ticket!"}), 500
