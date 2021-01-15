#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

TESTMON_OPT="--testmon"
if [[ $1 == "--all" ]]
then
	TESTMON_OPT="--testmon-noselect"
	shift
fi

py.test tests/unit "$@"
py.test tests/integration ${TESTMON_OPT} --no-cov "$@"
py.test tests/integration-async ${TESTMON_OPT} --no-cov "$@"
