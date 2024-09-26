#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

SNOW_URL = "https://cerntraining.service-now.com"
SNOW_VERIFY_SSL = False
SNOW_CLIENT_ID = "change-me"
SNOW_CLIENT_SECRET = "change-me"
SNOW_AUTH_URL = ""
SNOW_INSPIRE_FUNCTIONAL_ELEMENT = "ea56eb930a0a8c0a0004af7b268a0987"
SNOW_INSPIRE_USER_ID = "ce1dd215873b951069c063990cbb35a7"
SNOW_USERS_EMAILS_MAPPING = {"testemail@cern.ch": "testemail@non-cern-domain.com"}
SNOW_INSPIRE_ASSIGNEMENT_GROUP = "1234"
SNOW_OVERRIDE_FUNCTIONAL_CATEGORY = "1234"
SNOW_CACHE_TIMEOUT = 86400
SNOW_TICKETS_ENDPOINT = "u_request_fulfillment"
SNOW_THIRD_PARTY_TICKET_ENDPOINT = "u_third_party_ticket_inspire"
SNOW_TICKET_STATUS_MAPPING = {
    "resolved": "9",
    "waiting": "6",
    "in progress": "4",
    "assigned": "2",
}
SNOW_QUEUE_TO_FUNCTIONAL_CATEGORY_MAPPING = {
    "HEP_add_user": "Literature submissions",
    "HAL_curation": "HAL curation",
    "HEP_curation": "arXiv curation",
    "HEP_curation_jlab": "arXiv curation",
    "HEP_publishing": "Publisher curation",
    "AUTHORS_curation": "Author curation",
    "Authors_cor_user": "Author updates",
    "Authors_add_user": "Author submissions",
    "AUTHORS_cor_user": "Author submissions",
    "CONF_add_user": "Conferences",
    "SEMINARS": "Seminars",
    "AUTHORS_claim_manual": "Author claims",
    "JOBS": "Jobs",
}
