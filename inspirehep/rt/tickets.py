# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from functools import wraps
from urllib.parse import urljoin, urlparse

from flask import current_app, render_template
from invenio_cache import current_cache
from rt import ALL_QUEUES, AuthorizationError, Rt

from .proxies import rt_instance


class InspireRt(Rt):
    def get_attachments(self, ticket_id):
        """Get attachment list for a given ticket.
        Copy-pased from rt library, only change is starting form 3rd line of
        response for attachments to look for attachments.

        Args:
            ticket_id (int): The ticket id.

        Returns:
            list(tuple): List of tuples for attachments belonging to given ticket.
                Tuple format: (id, name, content_type, size)
                Returns None if ticket does not exist.
        """
        msg = self._Rt__request("ticket/%s/attachments" % (str(ticket_id),))
        lines = msg.split("\n")
        if (len(lines) > 2) and self.RE_PATTERNS["does_not_exist_pattern"].match(
            lines[2]
        ):
            return None
        attachment_infos = []
        if (self._Rt__get_status_code(lines[0]) == 200) and (len(lines) >= 3):
            for line in lines[3:]:
                info = self.RE_PATTERNS["attachments_list_pattern"].match(line)
                if info:
                    attachment_infos.append(info.groups())
        return attachment_infos


class EditTicketException(Exception):
    pass


def relogin_if_needed(f):
    """Repeat RT call after explicit login, if needed.

    In case a call to RT fails, due session expired, this decorator will
    explicitly call .login() on RT, in order to refresh the session, and
    will replay the call.
    This decorator should be used to wrap any function calling into RT.
    FIXME: The real solution would be to enable auth/digest authentication
    on RT side. Then this trick would no longer be needed, as long as the
    extension is properly initialized in ext.py.
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except AuthorizationError:
            rt_instance.login()
            return f(*args, **kwargs)

    return decorated_function


@relogin_if_needed
def create_ticket(queue, requestors, body, subject=None, recid=None, **kwargs):
    """Creates new RT ticket with a body that is rendered template.

    Args:
        queue (str): The queue.
        requestors (str): The username to set to requestors field of the ticket.
        body (str): The body of the ticket
        subject (str): The subject of the ticket.
        recid (int): The record id to be set custom RecordID field.
        kwargs : Other arguments possible to set:
                    Cc, AdminCc, Owner, Status,Priority, InitialPriority,
                    FinalPriority, TimeEstimated, Starts, Due,
                    ... (according to RT fields)
                    Custom fields CF.{<CustomFieldName>} could be set
                    with keywords CF_CustomFieldName.
    Returns:
        int: the ID of the ticket or ``-1`` if fails.
    """
    body = _strip_lines(body)
    subject = subject or "No Subject"

    queue = current_app.config.get("RT_OVERRIDE_QUEUE") or queue

    payload = dict(Queue=queue, Subject=subject, Text=body, **kwargs)

    if recid:
        payload["CF_RecordID"] = str(recid)

    # Check if requests is set and also ignore admin due to RT mail loop
    if requestors and "admin@inspirehep.net" not in requestors:
        payload["requestors"] = requestors

    return rt_instance.create_ticket(**payload)


def create_ticket_with_template(
    queue, requestors, template_path, template_context, subject, recid=None, **kwargs
):
    """Creates new RT ticket with a body that is rendered template.

    Args:
        queue (str): The queue.
        requestors (str): The username to set to requestors field of the ticket.
        template_path (str): The path to the template for the ticket body.
        template_context (dict): The context object to be used to render template.
        subject (str): The subject of the ticket.
        recid (int): The record id to be set custom RecordID field.
        kwargs : Other arguments possible to set:
                    Cc, AdminCc, Owner, Status,Priority, InitialPriority,
                    FinalPriority, TimeEstimated, Starts, Due,
                    ... (according to RT fields)
                    Custom fields CF.{<CustomFieldName>} could be set
                    with keywords CF_CustomFieldName.
    Returns:
        int: the ID of the ticket or ``-1`` if fails.
    """
    body = render_template(template_path, **template_context).strip()
    return create_ticket(queue, requestors, body, subject, recid, **kwargs)


@relogin_if_needed
def resolve_ticket(ticket_id):
    """Resolves the given ticket.

    Args:
        ticket_id (int): The ticket id.
    """
    try:
        rt_instance.edit_ticket(ticket_id=ticket_id, Status="resolved")
    except IndexError:
        # Raise exception only if ticket isn't already resolved
        ticket = rt_instance.get_ticket(ticket_id)
        if ticket["Status"] != "resolved":
            raise EditTicketException()


def get_queues():
    """Returns list of all queues.

    Returns:
        list (dict): list of all queues as {id, name}.
    """
    queues = current_cache.get("rt_queues")
    if queues:
        return queues
    else:
        queues = _get_all_of("queue")
        if queues:
            current_cache.set(
                "rt_queues",
                queues,
                timeout=current_app.config.get("RT_QUEUES_CACHE_TIMEOUT", 86400),
            )
        return queues


def get_users():
    """Get users.

    Returns:
        list (dict): list of all users as {id, name} dict
    """
    queues = current_cache.get("rt_users")
    if queues:
        return queues
    else:
        queues = _get_all_of("user")
        if queues:
            current_cache.set(
                "rt_users",
                queues,
                timeout=current_app.config.get("RT_USERS_CACHE_TIMEOUT", 86400),
            )
        return queues


@relogin_if_needed
def _get_all_of(query_type):
    """Utility function.

    To share the code for performing custom get all requests
    and parsing the result.

    Args:
    query_type (dict): he type of quer, either ``'queue'`` or ``'user'``.
    """
    search_query = "search/" + query_type + "?query="
    url = urljoin(rt_instance.url, search_query)
    response = rt_instance.session.get(url)
    raw_result = response.content.decode(response.encoding.lower())
    # parse raw result
    lines = raw_result.split("\n")
    # remove status and empty lines
    del lines[:2]
    del lines[-3:]
    # create dict for each result item
    return map(_query_result_item_id_name_mapper, lines)


def _query_result_item_id_name_mapper(raw_item):
    """Mapper function.

    Takes a string like ``'17: CoolUser'`` and
    returns ``{'id': '17', 'name': 'CoolUser'}``
    """
    id_, name = raw_item.split(": ")
    return {"id": id_, "name": name}


def _strip_lines(multiline_string):
    """ Removes space at the end of each line and puts space beginning of
    each line except the first."""
    return "\n ".join([line.strip() for line in multiline_string.strip().split("\n")])


@relogin_if_needed
def get_tickets_by_recid(recid, exclude_resolved=True, with_extra_attributes=True):
    """Returns all tickets that are associated with the given recid.

    Args:
        recid (int): The record id.
    """
    search_params = dict(Queue=ALL_QUEUES, CF_RecordID=str(recid))
    if exclude_resolved:
        search_params["Status__notexact"] = "resolved"
    tickets_for_recid = rt_instance.search(**search_params)
    if with_extra_attributes:
        return map(_set_extra_attributes, tickets_for_recid)
    else:
        return tickets_for_recid


def _set_extra_attributes(ticket):
    """Sets better ticket id, Text and Link for given ticket."""
    # `ticket['id']` has format of `'ticket/<ticket_id>'`
    ticket_id = ticket["id"].split("/")[1]
    ticket["Id"] = ticket_id
    ticket["Text"] = _get_ticket_text(ticket_id)
    ticket["Link"] = get_rt_link_for_ticket(ticket_id)
    return ticket


def _get_ticket_text(ticket_id):
    """Returns the first plain text attachment or empty string for given ticket."""
    attachments_ids = rt_instance.get_attachments_ids(ticket_id)
    for attachment_id in attachments_ids:
        attachment = rt_instance.get_attachment(ticket_id, attachment_id)
        if attachment["ContentType"] == "text/plain":
            return attachment["Content"]
    return ""


def get_rt_link_for_ticket(ticket_id):
    """ Returns rt system display link to given ticket.

    Args:
        ticket_id (int): The ticket id.
    """
    parsed_url = urlparse(rt_instance.url)
    return "{}://{}/Ticket/Display.html?id={}".format(
        parsed_url.scheme, parsed_url.netloc, ticket_id
    )


@relogin_if_needed
def reply_ticket(ticket_id, body, keep_new=False):
    """Replies the given ticket with the message body

    Args:
        ticket_id (int): The ticket id.
        body (str): The message body.
        keep_new (bool):  Flag to keep ticket ``Status``, ``'new'``.
    """
    body = _strip_lines(body)
    # to workaround UnicodeEncodeError raised by rt because of special chars
    body = body.encode("utf-8")

    rt_instance.reply(ticket_id=ticket_id, text=body)

    if keep_new:
        rt_instance.edit_ticket(ticket_id=ticket_id, Status="new")


def reply_ticket_with_template(
    ticket_id, template_path, template_context, keep_new=False
):
    """Replies the given ticket with a body that is rendered template."""
    body = render_template(template_path, **template_context).strip()
    return reply_ticket(ticket_id, body, keep_new=keep_new)
