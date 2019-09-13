# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Inspire"""

import os

from setuptools import find_packages, setup

INVENIO_VERSION = "3.1.0.dev20181106"

packages = find_packages()


# Get the version string. Cannot be done with import!
g = {}
with open(os.path.join("inspirehep", "version.py"), "rt") as fp:
    exec(fp.read(), g)
    version = g["__version__"]

setup(
    name="inspirehep",
    version=version,
    description=__doc__,
    keywords="inspirehep Invenio",
    license="MIT",
    author="CERN",
    author_email="info@inspirehep.net",
    url="https://github.com/inspirehep/inspirehep",
    packages=packages,
    zip_safe=False,
    include_package_data=True,
    platforms="any",
    entry_points={
        "console_scripts": ["inspirehep = inspirehep.cli:cli"],
        "invenio_db.alembic": ["inspirehep = inspirehep:alembic"],
        "invenio_pidstore.minters": [
            "literature_minter = inspirehep.pidstore.minters.control_number:LiteratureMinter.mint",
            "authors_minter = inspirehep.pidstore.minters.control_number:AuthorsMinter.mint",
            "jobs_minter = inspirehep.pidstore.minters.control_number:JobsMinter.mint",
            "journals_minter = inspirehep.pidstore.minters.control_number:JournalsMinter.mint",
            "experiments_minter = inspirehep.pidstore.minters.control_number:ExperimentsMinter.mint",
            "conferences_minter = inspirehep.pidstore.minters.control_number:ConferencesMinter.mint",
            "data_minter = inspirehep.pidstore.minters.control_number:DataMinter.mint",
            "institutions_minter = inspirehep.pidstore.minters.control_number:InstitutionsMinter.mint",
        ],
        "invenio_base.api_blueprints": [
            "inspirehep_mailing = inspirehep.mailing.views:blueprint",
            "inspirehep_migrator = inspirehep.migrator.views:blueprint",
            "inspirehep_records = inspirehep.records.views:blueprint",
            "inspirehep_rt = inspirehep.rt.views:blueprint",
            "inspirehep_submissions = inspirehep.submissions.views:blueprint",
            "inspirehep_disambiguation = inspirehep.disambiguation.views:blueprint",
        ],
        "invenio_config.module": [
            "inspirehep = inspirehep.config",
            "inspirehep_logger = inspirehep.logger.config",
            "inspirehep_mailing = inspirehep.mailing.config",
            "inspirehep_migrator = inspirehep.migrator.config",
            "inspirehep_orcid = inspirehep.orcid.config",
            "inspirehep_records = inspirehep.records.config",
            "inspirehep_rt = inspirehep.rt.config",
        ],
        "invenio_base.api_apps": [
            "inspirehep_logger = inspirehep.logger:InspireLogger",
            "inspirehep_mailing = inspirehep.mailing:InspireMailing",
            "inspirehep_migrator = inspirehep.migrator:InspireMigrator",
            "inspirehep_orcid = inspirehep.orcid:InspireOrcid",
            "inspirehep_records = inspirehep.records:InspireRecords",
            "inspirehep_rt = inspirehep.rt:InspireRtExt",
        ],
        "invenio_jsonschemas.schemas": ["inspirehep_records_schemas = inspire_schemas"],
        "invenio_search.mappings": ["records = inspirehep.search.mappings"],
        "invenio_db.models": [
            "inspirehep_records = inspirehep.records.models",
            "inspirehep_migrator = inspirehep.migrator.models",
        ],
        "invenio_celery.tasks": [
            "inspirehep_indexer = inspirehep.records.indexer.tasks",
            "inspirehep_migrator = inspirehep.migrator.tasks",
            "inspirehep_orcid = inspirehep.orcid.tasks",
            "inspirehep_submissions = inspirehep.submissions.tasks",
            "inspirehep.disambiguation = inspirehep.disambiguation.tasks",
        ],
    },
    classifiers=[
        "Environment :: Web Environment",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Development Status :: 3 - Alpha",
    ],
)
