#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


S3_HOSTNAME = "http://localhost:4566"
S3_ACCESS_KEY = "CHANGE_ME"
S3_SECRET_KEY = "CHANGE_ME"
S3_BUCKET_PREFIX = "inspire-files-"
S3_FILE_ACL = "public-read"
S3_BIBLIOGRAPHY_GENERATOR_BUCKET = "inspire-tmp"
S3_EDITOR_BUCKET = "inspire-editor"

FILES_MAX_UPLOAD_THREADS = 5
FILES_UPLOAD_THREAD_TIMEOUT = 120
FILES_DOWNLOAD_TIMEOUT = 60
FILES_PUBLIC_PATH = "/files/"
UPDATE_S3_FILES_METADATA = False
