# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""JSON Schemas."""

from inspire_schemas.builders.jobs import JobBuilder
from marshmallow import Schema, fields, missing, post_load, pre_dump


class Job(Schema):
    title = fields.Raw()
    status = fields.Raw()
    external_job_identifier = fields.Raw(allow_none=True)
    institutions = fields.Raw()
    regions = fields.Raw()
    ranks = fields.Raw()
    field_of_interest = fields.Raw()  # arxiv
    experiments = fields.Raw()
    url = fields.Raw()
    deadline_date = fields.Raw()
    contacts = fields.Raw()
    reference_letter_contact = fields.Raw()
    description = fields.Raw()

    @pre_dump
    def before_dump(self, data) -> dict:
        """Process JobRecord for serializer.

        Args:
            data (JobRecord): JobRecord object with job to serialize.

        Returns:
            dict: Data prepared for the serializer.
        """
        institutions = [
            {"value": record.get("value"), "record": record.get("record")}
            for record in data.get_value("institutions", [])
        ]

        experiments = [
            {"legacy_name": record.get("legacy_name"), "record": record.get("record")}
            for record in data.get_value("accelerator_experiments", [])
        ]
        contacts = [
            {"name": contact.get("name"), "email": contact.get("email")}
            for contact in data.get_value("contact_details", [])
        ]

        ref_email = data.get_value("reference_letters.emails[0]", "")
        ref_url = data.get_value("reference_letters.urls[0]", {})
        ref_letter_contact = {"email": ref_email, "url": ref_url.get("value", "")}

        processed_data = {
            "title": data.get_value("position", missing),
            "status": data.get_value("status", "pending"),
            "external_job_identifier": data.get_value(
                "external_job_identifier", missing
            ),
            "institutions": institutions or missing,
            "regions": data.get_value("regions", missing),
            "ranks": data.get_value("ranks", missing),
            "field_of_interest": data.get_value("arxiv_categories", ["other"]),
            "experiments": experiments or missing,
            "url": data.get_value("urls[0].value", missing),
            "deadline_date": data.get_value("deadline_date", missing),
            "contacts": contacts or missing,
            "reference_letter_contact": ref_letter_contact or missing,
            "description": data.get_value("description", missing),
        }
        return processed_data

    @post_load
    def build_job(self, data):
        """Process data from the form and build record data form it.

        Args:
            data (dict): Data from the form

        Returns
            dict: Processed data by the job_builder of the record

        """
        job_builder = JobBuilder()

        job_builder.set_status(data.get("status"))
        job_builder.set_title(data.get("title"))
        job_builder.set_deadline(data.get("deadline_date"))
        job_builder.set_description(data.get("description"))
        job_builder.set_external_job_identifier(data.get("external_job_identifier"))

        job_builder.add_url(data.get("url"))

        for institution in data.get("institutions", []):
            job_builder.add_institution(**institution)
        for region in data.get("regions", []):
            job_builder.add_region(region)
        for arxiv in data.get("field_of_interest", []):
            job_builder.add_arxiv_category(arxiv)
        for rank in data.get("ranks", []):
            job_builder.add_rank(rank)
        for experiment in data.get("experiments", []):
            job_builder.add_accelerator_experiment(**experiment)
        for contact in data.get("contacts", []):
            job_builder.add_contact(**contact)

        reference_contact = data.get("reference_letter_contact", {})
        job_builder.add_reference_email(reference_contact.get("email"))
        job_builder.add_reference_url(reference_contact.get("url"))

        return job_builder.record
