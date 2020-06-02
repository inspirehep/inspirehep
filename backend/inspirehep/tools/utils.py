# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import re
from os.path import splitext

from werkzeug.utils import secure_filename

from inspirehep.search.api import LiteratureSearch

FORMAT_TO_SOURCE_FIELD = {
    "latex_eu": "_latex_eu_display",
    "latex_us": "_latex_us_display",
    "bibtex": "_bibtex_display",
}


def get_references(f):
    """Extract references from LaTeX string (whole file)"""

    references = []
    cstrip = re.compile(r"(?<!\\)%.*$", re.M)

    for num, line in enumerate(f, 1):
        if cstrip.match(line):
            continue
        cites = re.findall(r"\\cite\s*\{(.*?)\}", line, re.DOTALL)
        for ref_line in cites:
            ref_list = ref_line.split(",")
            for one_ref in ref_list:
                one_ref = re.sub(r"\s", "", one_ref)
                if re.match(r"^#\d{1,2}$", one_ref):
                    continue
                if not any(r[0] == one_ref for r in references):
                    references.append((one_ref, num))

    return references


def find_references(references, requested_format):
    display_format = FORMAT_TO_SOURCE_FIELD[requested_format]

    ret = []
    errors = []
    for ref, line in references:
        keyword = None
        if re.search(r"^\d{4}[\w.&]{15}$", ref):
            # ads
            keyword = "external_system_identifiers.value"
        elif re.search(r".*\:\d{4}\w\w\w?", ref):
            keyword = "texkey"
        elif re.search(r".*\/\d{7}", ref):
            keyword = "eprint"
        elif re.search(r"\d{4}\.\d{4,5}", ref):
            keyword = "eprint"
        elif re.search(r"\w\.\w+\.\w", ref):
            keyword = "j"
            ref = re.sub(r"\.", ",", ref)
        elif re.search(r"\w\-\w", ref):
            keyword = "r"

        results = (
            LiteratureSearch()
            .query_from_iq(f"{keyword}:{ref}")
            .params(size=2, _source=display_format)
            .execute()
        )

        hits = results.hits.hits
        if len(hits) == 0:
            errors.append({"ref": ref, "line": line, "type": "not found"})
        elif len(hits) > 1:
            errors.append({"ref": ref, "line": line, "type": "ambiguous"})
        else:
            ret.append(hits[0]["_source"][display_format])

    return ret, errors


def get_mimetype(requested_format):
    if requested_format == "bibtex":
        return "application/x-bibtex"
    return "application/x-latex"


def get_filename(filename, requested_format):
    extension = ".bib" if requested_format == "bibtex" else "-references.tex"
    return secure_filename(splitext(filename)[0] + extension)
