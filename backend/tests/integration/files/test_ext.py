# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from concurrent.futures import ThreadPoolExecutor

from flask import Flask, current_app

from inspirehep.files import InspireS3
from inspirehep.files.proxies import current_s3_instance


def test_ext():
    """Test extension initialization."""
    app = Flask("testapp")
    InspireS3(app)

    assert "inspirehep-s3" in app.extensions


def test_threads_have_separate_s3_connections(inspire_app):
    def thread_function(app_context):
        with app_context.app.app_context():
            return {
                "client": id(current_s3_instance.client),
                "resource": id(current_s3_instance.resource),
            }

    with ThreadPoolExecutor(max_workers=1) as executor:
        task = executor.submit(thread_function, current_app.app_context())
        result_data = task.result()
        assert result_data["client"] != id(current_s3_instance.client)
        assert result_data["resource"] != id(current_s3_instance.resource)
