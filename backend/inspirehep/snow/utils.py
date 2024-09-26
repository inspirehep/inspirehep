#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


def get_response_result(response):
    return response.json()["result"]


def strip_lines(multiline_string):
    """Removes space at the end of each line and puts space beginning of
    each line except the first."""
    if not multiline_string:
        return ""
    return "\n ".join([line.strip() for line in multiline_string.strip().split("\n")])
