#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import abc

import six
from invenio_db import db


@six.add_metaclass(abc.ABCMeta)
class TestBaseModel:
    model_class = None

    @classmethod
    def create_from_kwargs(cls, kwargs):
        """
        Create a new instance of the model_class for this test class using
        the given kwargs. And add it to the db session.
        """
        filtered_kwargs = cls._filter_kwargs_for_model(kwargs, cls.model_class)
        instance = cls.model_class(**filtered_kwargs)
        db.session.add(instance)
        return instance

    @staticmethod
    def _filter_kwargs_for_model(kwargs, model_class):
        """
        Filter the given kwargs and keep only those that make sense for
        the given model_class.

        Args:
            kwargs (dict): a dictionary.
            model_class: the DB model class to filter the kwargs for.


        Returns:
            dict: a dict containing only those kwargs that make sense
             for the given model_class.
        """
        model_attrs = dir(model_class)
        attrs = [name for name in kwargs if name in model_attrs]
        return {name: kwargs[name] for name in attrs}
