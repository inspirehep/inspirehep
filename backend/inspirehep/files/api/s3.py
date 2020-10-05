# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from urllib.parse import urljoin, urlsplit

import structlog
from boto3.s3.transfer import TransferConfig
from botocore.exceptions import ClientError
from flask import current_app
from werkzeug import secure_filename

from inspirehep.utils import get_inspirehep_url

LOGGER = structlog.getLogger()


class S3:
    def __init__(self, client, resource, config=None):
        self.client = client
        self.resource = resource
        if not config:
            config = TransferConfig(max_concurrency=1, use_threads=False)
        self.config = config

    @property
    def public_file_path(self):
        return urljoin(
            get_inspirehep_url(), current_app.config.get("FILES_PUBLIC_PATH")
        )

    @staticmethod
    def get_bucket_for_file_key(key):
        """Return the bucket for the given file key.

        :param key: the file key
        :return: bucket: The corresponding bucket.
        """
        return S3.get_prefixed_bucket(key[0])

    @staticmethod
    def get_prefixed_bucket(bucket_without_prefix):
        """Returns prefixed bucket for given bucket"""

        return f"{current_app.config.get('S3_BUCKET_PREFIX')}{bucket_without_prefix}"

    @staticmethod
    def is_s3_url(url):
        """Checks if the url is an S3 url.

        :param url: the given url.
        :return: boolean
        """
        return url.startswith(current_app.config.get("S3_HOSTNAME"))

    @staticmethod
    def is_s3_url_with_bucket_prefix(url):
        """Checks if the url is an S3 bucket and if contains `S3_BUCKET_PREFIX`.

        :param url: the given url.
        :return: boolean
        """
        return S3.is_s3_url(url) and current_app.config.get("S3_BUCKET_PREFIX") in url

    def is_public_url(self, url):
        """Checks if the url is an file public url

        :param url: the given url.
        :return: boolean
        """
        return url.startswith(self.public_file_path)

    def upload_file(self, data, key, filename, mimetype, acl, bucket=None):
        """Upload a file in s3 bucket with the given metadata

        :param data: the data of the file.
        :param key: the key of the file.
        :param filename: the filename.
        :param mimetype: the mimetype of the file.
        :param acl: the access control list for the file.
        :return: dict
        """

        if not bucket:
            bucket = self.get_bucket_for_file_key(key)
        try:
            response = self.client.upload_fileobj(
                data,
                bucket,
                key,
                ExtraArgs={
                    "ContentType": mimetype,
                    "ACL": acl,
                    "ContentDisposition": self.get_content_disposition(filename),
                },
                Config=self.config,
            )
            return response
        except ClientError as e:
            LOGGER.warning(exc=e, key=key)
            raise

    def delete_file(self, key):
        """Deletes the given file from S3.

        :param key: the key of the file.
        :return: dict
        """
        try:
            response = self.client.delete_object(
                Bucket=self.get_bucket_for_file_key(key), Key=key
            )
            return response
        except ClientError as e:
            LOGGER.warning(exc=e, key=key)
            raise

    @staticmethod
    def get_s3_url(key, bucket=None):
        """Returns the S3 link for the file.

        :param key: the key of the file.
        :param bucket: bucket in which file is located. If not provided default s3-files bucket is generated.
        :return: string: the s3 link for the file.
        """
        if not bucket:
            bucket = S3.get_bucket_for_file_key(key)
        return f"{current_app.config.get('S3_HOSTNAME')}/{bucket}/{key}"

    def get_public_url(self, key):
        """Returns the public url for the file.

        :param key: the key of the file.
        :return: string: the s3 link for the file.
        """
        return urljoin(self.public_file_path, key)

    @staticmethod
    def get_content_disposition(filename):
        without_subformat = S3.remove_subformat(filename)
        return f'inline; filename="{secure_filename(without_subformat)}"'

    @staticmethod
    def remove_subformat(filename):
        parts = filename.split(".")

        if len(parts) == 0:
            return filename

        ext = parts.pop()
        ext_without_subformat = ext.split(";")[0]
        filename = ".".join(parts)

        return f"{filename}.{ext_without_subformat}"

    def replace_file_metadata(self, key, filename, mimetype, acl):
        """Updates the metadata of the given file.

        :param key: the file key.
        :param filename: the new filename.
        :param mimetype: the new mimetype.
        :param acl: the new access control list for the file.
        :return: dict
        """
        try:
            response = self.client.copy_object(
                ACL=acl,
                Bucket=self.get_bucket_for_file_key(key),
                Key=key,
                CopySource={"Bucket": self.get_bucket_for_file_key(key), "Key": key},
                ContentDisposition=self.get_content_disposition(filename),
                ContentType=mimetype,
                MetadataDirective="REPLACE",
            )
            return response
        except ClientError as e:
            LOGGER.warning(exc=e, key=key)
            raise

    def get_file_metadata(self, key):
        """Returns the metadata of the file.

        :param key: the key of the file.
        :return: the metadata of the file.
        """
        try:
            object_head = self.client.head_object(
                Bucket=self.get_bucket_for_file_key(key), Key=key
            )
            return object_head
        except ClientError as e:
            LOGGER.warning(exc=e, key=key)
            raise

    def file_exists(self, key):
        """Checks if the file is already in S3.

        :param key: the key of the file.
        :return: boolean
        """
        try:
            self.client.head_object(Bucket=self.get_bucket_for_file_key(key), Key=key)
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return False
            else:
                LOGGER.warning(exc=e, key=key)
                raise

    def create_bucket(self, bucket):
        return self.client.create_bucket(
            Bucket=self.get_prefixed_bucket(bucket),
            ACL=current_app.config.get("S3_FILE_ACL"),
        )

    def get_key_from_url(self, url):
        try:
            return urlsplit(url).path.split("/")[-1]
        except (IndexError, AttributeError):
            LOGGER.exception("S3 incorrect url.", url=url)
            raise

    def convert_to_s3_url(self, url):
        """Converts public url to s3 url.

        :param url: Full public url
        :return: Full s3 url
        """
        if self.is_public_url(url):
            key = self.get_key_from_url(url)
            return self.get_s3_url(key)
        return None

    def convert_to_public_url(self, url):
        """converts s3 url to public url.

        :param url: Full public url
        :return: Full public url
        """
        if self.is_s3_url(url):
            key = self.get_key_from_url(url)
            return self.get_public_url(key)
        return None
