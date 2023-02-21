# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import urllib.parse
from functools import cached_property, wraps

import backoff
import orjson
import requests
import structlog
from flask import current_app, render_template
from inspire_utils.record import get_value
from invenio_cache import current_cache

from inspirehep.utils import DistributedLockError, distributed_lock

from .errors import CreateTicketException, EditTicketException, SnowAuthenticationError
from .utils import get_response_result, strip_lines

LOGGER = structlog.getLogger()


class SnowTicketAPI:
    """Implements basic methods to interact with SNOW (CERN implementation).

    Attributes:
        client_id (str): the id of the snow integration.
        secret (str): the client secret.
        auth_url (str): the url used to obtain the authentication token.
        verify_cert (bool): is SSL certificate verification enabled.
        url (str): the url of SNOW API.
    """

    def __init__(
        self, url=None, client_id=None, secret=None, auth_url=None, verify_cert=True
    ):
        self.client_id = client_id or current_app.config.get("SNOW_CLIENT_ID")
        self.secret = secret or current_app.config.get("SNOW_CLIENT_SECRET")
        self.auth_url = auth_url or current_app.config.get("SNOW_AUTH_URL")
        self.verify_cert = verify_cert
        self.base_url = url or current_app.config.get("SNOW_URL", "")
        self.api_url = f"{self.base_url}/api/now/table"

    def relogin_if_needed(f):
        """Recalculate SNOW token if it's invalid."""

        @wraps(f)
        def decorated_function(self, *args, **kwargs):
            try:
                return f(self, *args, **kwargs)
            except requests.exceptions.HTTPError:
                if hasattr(self, "token"):
                    del self.__dict__["token"]
                return f(self, *args, **kwargs)

        return decorated_function

    @cached_property
    def token(self):
        token = current_cache.get("snow-token-value")
        if not token:
            token = self.get_token()
            self.write_token_to_cache(token)
        return token

    @property
    def headers(self):
        """Request headers."""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    @backoff.on_exception(backoff.expo, exception=DistributedLockError, max_tries=5)
    def write_token_to_cache(self, token):
        try:
            with distributed_lock("snow-token-lock", blocking=False):
                current_cache.set("snow-token-value", token)
        except DistributedLockError:
            LOGGER.error(
                "Can't acquire snow token from cache, other process acquired the lock."
            )
            raise SnowAuthenticationError

    def get_token(self):
        login_payload = {
            "grant_type": "client_credentials",
            "audience": "snow-api-sso-protected",
            "client_id": self.client_id,
            "client_secret": self.secret,
        }
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        }
        try:
            response = requests.post(self.auth_url, data=login_payload, headers=headers)
            response.raise_for_status()
            return response.json()["access_token"]
        except (requests.exceptions.RequestException, KeyError):
            raise SnowAuthenticationError

    @relogin_if_needed
    def create_ticket(self, endpoint, payload):
        """Creates a ticket.

        Args:
            endpoint (str): an endpoint name.
            payload (:obj:`dict`): ticket payload.
        """
        response = requests.post(
            f"{self.api_url}/{endpoint}",
            data=orjson.dumps(payload),
            headers=self.headers,
        )
        response.raise_for_status()
        return get_response_result(response)["sys_id"]

    @relogin_if_needed
    def get_ticket(self, ticket_id, params=None):
        """Get ticket by id.

        Args:
            params (str|:obj:`dict`, optional): params to be passed to the request query string.
                Defaults to None.
        """
        ticket_response = requests.get(
            f"{self.api_url}/u_request_fulfillment/{ticket_id}",
            params=params,
            headers=self.headers,
        )
        ticket_response.raise_for_status()
        return get_response_result(ticket_response)

    @relogin_if_needed
    def get_functional_category(self, category_id):
        """Get functional categoty by id.

        Args:
            category_id (str): SNOW sys_id of the category

         Returns:
            str: human-readable category name. None if the category is not found.
        """
        try:
            category = (
                self.get_functional_categories_from_cache()
                .get(category_id, {})
                .get("sys_name")
            )
            if not category:
                category = self.get_functional_categories_from_cache(force_update=True)[
                    category_id
                ].get("sys_name")
            return category
        except KeyError:
            LOGGER.warning(
                "Functional category was not found!", category_id=category_id
            )

    @relogin_if_needed
    def get_user(self, user_id):
        """Get user by id.

        Args:
            user_id (str): id of the user.

        Returns:
            (str): User name if the user exists. None if the user doesn't exist
        """
        try:
            user = self.get_users_from_cache().get(user_id, {}).get("user.name")
            if not user:
                user = self.get_users_from_cache(force_update=True)[user_id][
                    "user.name"
                ]
            return user
        except KeyError:
            LOGGER.warning("User was not found!", user_id=user_id)

    @relogin_if_needed
    def edit_ticket(self, ticket_id, payload):
        """Edit ticket.

        Args:
            ticket_id (str): id of the ticket.
            payload (:obj:`dict`): payload with edited data.

        Returns:
            Edited ticket (list(dict)).
        """
        response = requests.put(
            f"{self.api_url}/u_request_fulfillment/{ticket_id}",
            orjson.dumps(payload),
            headers=self.headers,
        )
        response.raise_for_status()
        return get_response_result(response)

    @relogin_if_needed
    def search(self, endpoint, query=None, fields=None):
        """Search in SNOW.

        Args:
            endpoint (str): endpont on which the search will be performed.
            query (str): search query parameters.
            fields (str): list of the fields returned by the search.

        Returns:
            :obj:`list` of :obj:`dict`: Found tickets.
        """
        search_parameters = []
        if query:
            search_parameters.append(("sysparm_query", query))
        if fields:
            search_parameters.append(("sysparm_fields", fields))
        search_parameters_query_string = urllib.parse.urlencode(
            search_parameters, safe="&=^"
        )
        response = requests.get(
            f"{self.api_url}/{endpoint}",
            params=search_parameters_query_string,
            headers=self.headers,
        )
        response.raise_for_status()
        return get_response_result(response)

    def get_functional_categories(self, query=None, fields=None):
        """Returns list of all functional categories.

        Args:
            query (str): query string for filtering functional categories.
            fields (str): list of fields to be returned in a search result.

        Returns:
            :obj:`list` of :obj:`dict`: list of all functional categories with requested fields.
        """

        return self.search("u_functional_element_category", query, fields)

    def get_functional_categories_from_cache(self, force_update=False):
        """Returns list of all functional categories.

        Args:
            force_update (bool): should cache entry be updated.

        Returns:
            :obj:`dict`: Dictionary of functional categories as {category_id: category_data}.
        """
        categories = current_cache.get("snow_functional_categories")
        if not categories or force_update:
            new_categories = {
                category["sys_id"]: category
                for category in self.get_functional_categories()
            }
            current_cache.set(
                "snow_functional_categories",
                new_categories,
                timeout=current_app.config.get("SNOW_CACHE_TIMEOUT", 86400),
            )
            return new_categories
        return categories

    def get_users(self, query=None, fields=None):
        """Get SNOW users.

        Args:
            query (str): query to filter the search result.
            fields (str): comma-separated list of relevant fields.

        Returns:
            :obj:`list` of :obj:`dict`: snow users matching the query string.
        """
        return self.search("sys_user_grmember", query, fields)

    def get_users_from_cache(self, force_update=False):
        """Returns list of all users from cache.
        Args:
            force_update (bool): should cache entry be updated

        Returns:
            dict of users as {user_id: user_data}
        """
        users = current_cache.get("snow_users")
        if not users or force_update:
            new_users = {user["user.sys_id"]: user for user in self.get_users()}
            current_cache.set(
                "snow_users",
                new_users,
                timeout=current_app.config.get("SNOW_CACHE_TIMEOUT", 86400),
            )
            return new_users
        return users


class InspireSnow(SnowTicketAPI):
    """Implements Inspire-specific methods to manage tickets related to Inspire."""

    def __init__(
        self,
        url=None,
        client_id=None,
        secret=None,
        auth_url=None,
        verify_cert=False,
        functional_element_id=None,
        user_id=None,
    ):
        super().__init__(url, client_id, secret, auth_url, verify_cert)
        self.functional_element_id = functional_element_id or current_app.config.get(
            "SNOW_INSPIRE_FUNCTIONAL_ELEMENT"
        )
        self.user_id = user_id or current_app.config.get("SNOW_INSPIRE_USER_ID")
        self.ticket_endpoint = current_app.config.get("SNOW_TICKETS_ENDPOINT")
        self.third_party_ticket_endpoint = current_app.config.get(
            "SNOW_THIRD_PARTY_TICKET_ENDPOINT"
        )
        self.ticket_status_mapping = current_app.config.get(
            "SNOW_TICKET_STATUS_MAPPING", {}
        )
        if not all(
            [
                self.ticket_endpoint,
                self.third_party_ticket_endpoint,
                self.functional_element_id,
                self.ticket_status_mapping,
            ]
        ):
            raise ValueError(
                f"ticket_endpoint, third_party_ticket_endpoint and functional_element_id are required to init {self.__class__.__name__}!"
            )

    def _update_ticket_with_inspire_recid(self, ticket_id, recid, assignee):
        """Update ticket with inspire recid.

        Creates a new, third party ticket and write its id to the original ticket.

        Args:
            ticket_id (str): ticket id.
            recid (str): record recid.
            assignee (str): id of the user who should be added to the ticket as an assigned person.
        """
        found_third_party_ticket_id = self._get_third_party_tickets_for_recid(recid)
        if found_third_party_ticket_id:
            third_party_ticket_id = found_third_party_ticket_id[0]["sys_id"]
        else:
            third_party_ticket_payload = {
                "u_third_party_ticket_id": recid,
            }
            third_party_ticket_id = self.create_ticket(
                endpoint=self.third_party_ticket_endpoint,
                payload=third_party_ticket_payload,
            )

        ticket_update_payload = {
            "assigned_to": assignee or self.user_id,
            "u_current_task_state": self.ticket_status_mapping["waiting"],
            "u_third_party": "INSPIRE",
            "u_third_party_ticket": third_party_ticket_id,
        }
        self.edit_ticket(ticket_id, payload=ticket_update_payload)
        if not assignee:
            self.edit_ticket(ticket_id, payload={"assigned_to": ""})

    def _get_third_party_tickets_for_recid(self, recid):
        """Returns all tickets that are associated with the given recid.

        Args:
            recid (int): The record id.
        """
        search_query = f"u_third_party_ticket_id={recid}"
        ticket = self.search(self.third_party_ticket_endpoint, search_query)
        return ticket

    def _prepare_query_string_from_parameters_dict(self, query_string_parameters):
        """Helper to prepare request query string in a SNOW specific way.

        Args:
            query_string_parameters (:obj:`dict`): query string parameters.

        Returns:
            query_string (str): formatted query string.
        """
        query_string = "^".join(
            f"{key}={value}" for key, value in query_string_parameters.items()
        )
        return query_string

    def get_tickets_by_recid(self, recid, exclude_resolved=True):
        """Returns all tickets that are associated with the given recid.

        Args:
            recid (int): The record id.
            exclude_resolved (bool): should resolved tickets be excluded from the response.

        Returns:
            :obj:`list`: list of found tickets,
        """
        third_party_search_query_string = f"u_third_party_ticket_id={recid}"
        tickets_search_parameters = dict(u_third_party="INSPIRE")
        if exclude_resolved:
            tickets_search_parameters[
                "u_current_task_state"
            ] = f"{self.ticket_status_mapping['waiting']}^ORu_current_task_state={self.ticket_status_mapping['assigned']}"
        try:
            third_party_ticket = self.search(
                self.third_party_ticket_endpoint, third_party_search_query_string
            )
            if not third_party_ticket:
                LOGGER.warning(
                    "Third party ticket for recid was not found!", recid=recid
                )
                return []
            tickets_search_parameters["u_third_party_ticket"] = third_party_ticket[0][
                "sys_id"
            ]
            tickets_search_query = self._prepare_query_string_from_parameters_dict(
                tickets_search_parameters
            )
            tickets_for_recid = self.search(self.ticket_endpoint, tickets_search_query)
            tickets_for_recid = [
                self.get_ticket_simplified_response(ticket)
                for ticket in tickets_for_recid
            ]
        except requests.exceptions.RequestException:
            LOGGER.error("Can't find tickets for recid", recid=recid)
            tickets_for_recid = []
        return tickets_for_recid

    def create_inspire_ticket(
        self,
        user_email=None,
        functional_category=None,
        subject=None,
        description=None,
        recid=None,
        **kwargs,
    ):
        """Creates new RT ticket with a body that is rendered template.

        Args:
            caller_id (str): The caller id.
            functional_category (str): The name of the functional category.
            description (str): The body of the ticket
            subject (str): The subject of the ticket.
            recid (int): The record id to be set custom RecordID field.
            assignee (str): Snow id of the account that should be assigned to the ticket.

        Returns:
            int: the ID of the ticket

        Raises: CreateTicketException, EditTicketException in case of failure
        """
        description = strip_lines(description)
        subject = subject or "No Subject"

        if user_email:
            snow_user_id = next(
                (
                    user["id"]
                    for user in self.get_formatted_user_list()
                    if user["email"] == user_email
                ),
                None,
            )
            caller_id = assignee = snow_user_id
        else:
            caller_id = self.user_id
            assignee = ""

        functional_category_id = next(
            (
                category["id"]
                for category in self.get_formatted_functional_category_list()
                if category["name"] == functional_category
            ),
            None,
        )

        if not functional_category_id:
            functional_category_id = current_app.config.get(
                "SNOW_OVERRIDE_FUNCTIONAL_CATEGORY"
            )

        payload = {
            "u_caller_id": caller_id,
            "u_functional_element": self.functional_element_id,
            "u_functional_category": functional_category_id,
            "short_description": subject,
            "description": description,
            "assignment_group": self.functional_element_id,
            **kwargs,
        }
        if not recid:
            payload["assigned_to"] = caller_id
        try:
            ticket_id = self.create_ticket(
                endpoint=self.ticket_endpoint, payload=payload
            )
            if recid:
                self._update_ticket_with_inspire_recid(
                    ticket_id, str(recid), assignee=assignee
                )
            return ticket_id
        except requests.exceptions.RequestException:
            raise CreateTicketException()

    def create_inspire_ticket_with_template(
        self,
        template_path,
        template_context,
        user_email=None,
        functional_category=None,
        subject=None,
        description=None,
        recid=None,
        **kwargs,
    ):
        """Creates a new SNOW ticket with a body that is rendered template.

        Args:
            template_path (str): The path to the template for the ticket body.
            template_context (dict): The context object to be used to render template.
            user_email (str): The caller id.
            functional_category (str): The name of the functional category.
            subject (str): The subject of the ticket.
            description (str): The body of the ticket.
            recid (int): The record id to be set custom RecordID field.
            kwargs : Other arguments possible to set.

        Returns:
            int: the ID of the ticket or None if fails.
        """
        description = render_template(template_path, **template_context).strip()
        return self.create_inspire_ticket(
            user_email, functional_category, subject, description, recid, **kwargs
        )

    def resolve_ticket(self, ticket_id, user_email=None, message=None):
        """Resolves the given ticket.

        Args:
            ticket_id (int): The ticket id.
            user_email (str): Email of the user as which action should be performed.
            message (str): message to be added when resolving the ticket.
        """
        if user_email:
            snow_user_id = next(
                (
                    user["id"]
                    for user in self.get_formatted_user_list()
                    if user["email"] == user_email
                ),
                None,
            )
        else:
            snow_user_id = None

        try:
            unassign_payload = {"assigned_to": ""}
            unassigned_ticket = self.edit_ticket(ticket_id, unassign_payload)
            if unassigned_ticket["assigned_to"] != "":
                raise EditTicketException()
            payload = {
                "u_current_task_state": self.ticket_status_mapping["resolved"],
                "u_close_code": "Fulfilled",
                "assigned_to": snow_user_id
                or current_app.config.get("SNOW_INSPIRE_USER_ID", ""),
                "comments": message or "Ticket has been closed",
            }
            self.edit_ticket(ticket_id, payload)
        except requests.exceptions.RequestException:
            # Raise exception only if ticket isn't already resolved
            ticket = self.get_ticket(ticket_id)
            if ticket["u_current_task_state"] != self.ticket_status_mapping["resolved"]:
                raise EditTicketException()

    def get_functional_categories(self):
        """Get functional categories for functional element Inspire"""
        query = f"u_functional_element={self.functional_element_id}"
        fields = "u_category_id,sys_name,sys_id"
        return super().get_functional_categories(query, fields)

    def get_formatted_functional_category_list(self):
        """
        Returns:
            list: the list with functional categories with following keys:
                  name (str)
                  id (str)
        """
        categories = self.get_functional_categories_from_cache()
        # TODO: When we'll stop using rt we can return list(categories.values())
        # this is because editor requires it
        categories = [
            {"name": category["sys_name"], "id": category["sys_id"]}
            for category in categories.values()
        ]
        return categories

    def get_users(self):
        """Get functional categories for functional element Inspire"""
        query = "group.nameSTARTSWITHInspire Information system"
        fields = "user.name,group.name,user.email,user.sys_id"
        return super().get_users(query, fields)

    def get_formatted_user_list(self):
        """
        Returns:
            :obj:`list`: the list with users.

        Examples:
            >>> print(self.get_formatted_user_list())
            [{"name": "Test User", "id": "23", "emai": "test@test.com}]
        """
        users = self.get_users_from_cache()
        # TODO: When we'll stop using rt we can return list(users.values())
        users = [
            {
                "name": user["user.name"],
                "id": user["user.sys_id"],
                "email": user["user.email"],
            }
            for user in users.values()
        ]
        return users

    def get_ticket_simplified_response(self, ticket):
        """Return ticket in human-readable format."""
        formatted_ticket = {}
        category_id = get_value(ticket, "u_functional_category.value")
        ticket_category = (
            self.get_functional_category(category_id) if category_id else ""
        )
        formatted_ticket["u_functional_category"] = ticket_category
        assigned_to = get_value(ticket, "assigned_to.value")
        asigned_user = self.get_user(assigned_to) if assigned_to else ""
        formatted_ticket["assigned_to"] = asigned_user
        formatted_ticket["sys_id"] = ticket["sys_id"]
        return formatted_ticket

    def get_ticket_link(self, ticket_id):
        """Return ticket API url."""
        return f"{self.base_url}/nav_to.do?uri=/u_request_fulfillment.do?sys_id=/{ticket_id}"
