# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from botocore.exceptions import ClientError
from flask import current_app

LOGGER = structlog.getLogger()


class S3:
    def __init__(self, client, resource):
        self.client = client
        self.resource = resource

    @staticmethod
    def get_bucket(key):
        """Return the bucket for the given file key.

        :param key: the file key
        :return: bucket: The corresponding bucket.
        """
        bucket = f"{current_app.config.get('S3_BUCKET_PREFIX')}{key[0]}"
        return bucket

    def upload_file(self, data, key, filename, mimetype, acl):
        """Upload a file in s3 bucket with the given metadata

        :param data: the data of the file.
        :param key: the key of the file.
        :param filename: the filename.
        :param mimetype: the mimetype of the file.
        :param acl: the access control list for the file.
        :return: dict
        """
        try:
            response = self.client.upload_fileobj(
                data,
                self.get_bucket(key),
                key,
                ExtraArgs={
                    "ContentType": mimetype,
                    "ACL": acl,
                    "ContentDisposition": self.get_content_disposition(filename),
                },
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
            response = self.client.delete_object(Bucket=self.get_bucket(key), Key=key)
            return response
        except ClientError as e:
            LOGGER.warning(exc=e, key=key)
            raise

    @staticmethod
    def get_file_url(key):
        """Returns the S3 link for the file.

        :param key: the key of the file.
        :return: string: the s3 link for the file
        """
        return f"{current_app.config.get('S3_HOSTNAME')}/{S3.get_bucket(key)}/{key}"

    @staticmethod
    def get_content_disposition(filename):
        return f'attachment; filename="{filename}"'

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
                Bucket=self.get_bucket(key),
                Key=key,
                CopySource={"Bucket": self.get_bucket(key), "Key": key},
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
            object_head = self.client.head_object(Bucket=self.get_bucket(key), Key=key)
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
            self.client.head_object(Bucket=self.get_bucket(key), Key=key)
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return False
            else:
                LOGGER.warning(exc=e, key=key)
                raise
