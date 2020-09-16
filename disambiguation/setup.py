# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2019 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

"""Inspire service for pushing records to HAL"""

from setuptools import setup


url = "https://github.com/inspirehep/inspire-disambiguation/"

readme = open("README.md").read()

setup_requires = ["autosemver~=0.0,>=0.5.3"]

setup(
    name="inspire-disambiguation",
    autosemver={"bugtracker_url": url + "/issues"},
    url=url,
    license="GPLv3",
    author="CERN",
    author_email="admin@inspirehep.net",
    include_package_data=True,
    zip_safe=False,
    platforms="any",
    description=__doc__,
    long_description=readme,
    setup_requires=setup_requires,
    entry_points={
        "console_scripts": ["inspire-disambiguation = inspire_disambiguation.cli:cli"]
    },
    classifiers=[
        "Development Status :: 1 - Planning",
        "Environment :: Web Environment",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
)
