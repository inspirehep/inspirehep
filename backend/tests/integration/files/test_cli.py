# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import override_config

from inspirehep.files import current_s3_instance
from inspirehep.files.cli import BUCKETS


def test_create_buckets(app_with_s3):
    config = {"S3_FILE_ACL": "public-read", "S3_BUCKET_PREFIX": "test-"}
    with override_config(**config):
        result = app_with_s3.cli.invoke(["files", "create_buckets"])

        assert result.exit_code == 0

        for bucket in BUCKETS:
            # asserts if bucket is created
            # throws NoSuchBucket, therefore fails the tests
            current_s3_instance.client.get_bucket_acl(Bucket=f"test-{bucket}")
