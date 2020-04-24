# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from flask import current_app
from helpers.utils import app_cli_runner

from inspirehep.cli import cli
from inspirehep.files import current_s3_instance
from inspirehep.files.cli import BUCKETS


def test_create_buckets(app_with_s3):
    runner = app_cli_runner()
    config = {"S3_FILE_ACL": "public-read", "S3_BUCKET_PREFIX": "test-"}
    with mock.patch.dict(current_app.config, config):
        result = runner.invoke(cli, ["files", "create_buckets"])

        assert result.exit_code == 0

        for bucket in BUCKETS:
            # asserts if bucket is created
            # throws NoSuchBucket, therefore fails the tests
            current_s3_instance.client.get_bucket_acl(Bucket=f"test-{bucket}")
