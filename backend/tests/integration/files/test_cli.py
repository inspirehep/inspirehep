# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock

from inspirehep.files.cli import BUCKETS, files


def test_create_buckets(app_cli_runner, base_app, s3):
    config = {"S3_FILE_ACL": "public-read", "S3_BUCKET_PREFIX": "test-"}
    with mock.patch.dict(base_app.config, config):
        result = app_cli_runner.invoke(files, ["create_buckets"])

        assert result.exit_code == 0

        for bucket in BUCKETS:
            # asserts if bucket is created
            # throws NoSuchBucket, therefore fails the tests
            s3.client.get_bucket_acl(Bucket=f"test-{bucket}")
