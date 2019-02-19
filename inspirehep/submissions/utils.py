# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

import requests
from flask import current_app
from inspire_dojson import marcxml2record
from inspire_utils.urls import record_url_by_pattern


def get_record_from_legacy(record_id=None):
    data = {}
    try:
        pattern = current_app.config["LEGACY_RECORD_URL_PATTERN"]
        url = record_url_by_pattern(pattern, record_id) + "/export/xm"
        xml = requests.get(url)
        record_regex = re.compile(r"\<record\>.*\<\/record\>", re.MULTILINE + re.DOTALL)
        xml_content = record_regex.search(xml.content).group()
        data = marcxml2record(xml_content)
    except requests.exceptions.RequestException:
        current_app.logger.error(
            "Failed to get record {} from legacy.".format(record_id)
        )
    except Exception:
        current_app.logger.error(
            "Error parsing the record {} from legacy.".format(record_id)
        )
    return data
