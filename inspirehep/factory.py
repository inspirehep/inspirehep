# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_app.factory import app_class, config_loader, create_api, instance_path
from invenio_base.app import create_app_factory
from invenio_base.wsgi import create_wsgi_factory

create_app = create_app_factory(
    "inspirehep",
    config_loader=config_loader,
    blueprint_entry_points=["invenio_base.api_blueprints"],
    extension_entry_points=["invenio_base.api_apps"],
    converter_entry_points=["invenio_base.api_converters"],
    wsgi_factory=create_wsgi_factory({"/api": create_api}),
    instance_path=instance_path,
    app_class=app_class(),
)
