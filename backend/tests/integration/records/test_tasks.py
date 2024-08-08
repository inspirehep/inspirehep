#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker
from helpers.utils import create_record
from inspirehep.records.models import (
    ConferenceLiterature,
    ExperimentLiterature,
    InstitutionLiterature,
    JournalLiterature,
    RecordCitations,
)
from inspirehep.records.tasks import get_query_for_given_path, update_records_relations
from inspirehep.search.api import InspireSearch


def test_update_records_relations(inspire_app):
    conference = create_record("con")
    conf_ref = f"http://localhost:8000/api/conferences/{conference['control_number']}"
    conference_lit_data = {
        "publication_info": [{"conference_record": {"$ref": conf_ref}}],
        "document_type": ["conference paper"],
    }
    cited_record_1 = create_record("lit", data=conference_lit_data)
    cited_record_2 = create_record("lit")

    data_citing_record_1 = faker.record(
        "lit", literature_citations=[cited_record_1["control_number"]]
    )
    data_citing_record_1["publication_info"] = [
        {"conference_record": {"$ref": conf_ref}}
    ]
    data_citing_record_1["document_type"] = ["conference paper"]

    citing_record_1 = create_record("lit", data=data_citing_record_1)

    data_citing_record_2 = faker.record(
        "lit",
        literature_citations=[
            cited_record_1["control_number"],
            cited_record_2["control_number"],
        ],
    )
    citing_record_2 = create_record("lit", data=data_citing_record_2)

    record_uuids = [
        cited_record_1.id,
        cited_record_2.id,
        citing_record_1.id,
        citing_record_2.id,
    ]

    result = update_records_relations(record_uuids)

    assert record_uuids == result

    result_citation_count_for_cited_record_1 = RecordCitations.query.filter_by(
        cited_id=cited_record_1.id
    ).count()
    result_citation_count_for_cited_record_2 = RecordCitations.query.filter_by(
        cited_id=cited_record_2.id
    ).count()

    expected_result_citation_count_for_cited_record_1 = 2
    expected_result_citation_count_for_cited_record_2 = 1

    assert (
        expected_result_citation_count_for_cited_record_1
        == result_citation_count_for_cited_record_1
    )
    assert (
        expected_result_citation_count_for_cited_record_2
        == result_citation_count_for_cited_record_2
    )

    assert ConferenceLiterature.query.count() == 2


def test_update_records_relations_updated_institution_literature_relations(inspire_app):
    institution = create_record("ins")
    inst_ref = f"http://localhost:8000/api/institutions/{institution['control_number']}"
    lit_data_with_institution = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [
                    {"value": "Institution", "record": {"$ref": inst_ref}}
                ],
            }
        ]
    }
    record = create_record("lit", data=lit_data_with_institution)

    result = update_records_relations([record.id])

    assert [record.id] == result

    institution_literature_relation = InstitutionLiterature.query.filter_by(
        institution_uuid=institution.id
    ).one()

    assert institution_literature_relation.literature_uuid == record.id


def test_update_records_relations_with_no_literatrure_records(inspire_app):
    record_con = create_record("con")
    record_aut = create_record("aut")
    record_job = create_record("job")

    record_uuids = [record_aut.id, record_job.id, record_con.id]
    result = update_records_relations(record_uuids)
    assert record_uuids == result


def test_update_records_relations_updated_experiment_literature_relations(inspire_app):
    experiment = create_record("exp")
    exp_ref = f"http://localhost:8000/api/experiments/{experiment['control_number']}"
    lit_data_with_experiment = {
        "accelerator_experiments": [
            {"legacy_name": "LIGO", "record": {"$ref": exp_ref}}
        ]
    }
    record = create_record("lit", data=lit_data_with_experiment)

    result = update_records_relations([record.id])

    assert [record.id] == result

    experiment_literature_relation = ExperimentLiterature.query.filter_by(
        experiment_uuid=experiment.id
    ).one()

    assert experiment_literature_relation.literature_uuid == record.id


def test_update_records_relations_updated_journal_literature_relations(inspire_app):
    journal = create_record("jou")
    lit_data_with_journal = {"publication_info": [{"journal_record": journal["self"]}]}
    record = create_record("lit", data=lit_data_with_journal)

    result = update_records_relations([record.id])

    assert [record.id] == result

    journal_literature_relation = JournalLiterature.query.filter_by(
        journal_uuid=journal.id
    ).one()

    assert journal_literature_relation.literature_uuid == record.id


def test_get_query_for_given_path_regression(inspire_app):
    relevant_job_data = {
        "ranks": ["POSTDOC"],
        "status": "closed",
        "$schema": "https://labs.inspirehep.net/api/schemas/records/jobs.json",
        "regions": ["Asia"],
        "position": "ATLAS Postdoctoral Research Fellow at Tsung-Dao Lee Institute",
        "description": '<div><strong>The Particle Physics Division (PD) at Tsung-Dao Lee Institute (TDLI)</strong>&nbsp;and&nbsp;<strong>Institute for Nuclear and Particle Physics (INPAC) at Shanghai Jiao Tong University (SJTU)</strong>, China invite applications for postdoctoral researcher positions to work on ATLAS experiment at LHC, CERN. We welcome highly motivated applicants who have obtained a Ph.D. degree or who are expecting one prior to starting the position, in nuclear physics, particle physics, or a related field. The initial appointment is for 2 years with possible renewal based on mutual satisfaction (up to 5 year maximum). PD@TDLI and INPAC@SJTU offer competitive salary commensurate with qualifications and subsidized housing options through the university. We will also encourage promising candidates in applying for the prestigious&nbsp;<strong>"Tsung-Dao Lee Postdoctoral Fellowship" and “Chung-Yao Chao Postdoctoral Fellowship” for additional benefits.</strong></div><div><br></div><div><strong>The successful candidate will participate in ATLAS experiment at CERN and with good opportunities to be based at CERN</strong>, and also has chance to travel to and work in Shanghai if needed. The appointee will be expected to make major contributions to ATLAS Run2/Run3 data analysis related to property measurements of the Higgs boson, searches for new physics beyond the Standard Model, Standard Model electroweak multi-boson physics, and top quark physics. The hardware experience with high granularity analogue/digital calorimeters, muon spectrometer, and silicon detectors will be advantageous.</div><div><br></div><div><strong>TDLI is a newly established prestigious national research institute in China, initiated by Prof. Tsung-Dao Lee</strong>&nbsp;(University Professor Emeritus at Columbia Univ., USA; Nobel Prize in Physics 1957, Albert Einstein Award 1957), directly approved by China’s Central Government, co-funded by Ministry of Science and Technology, the Ministry of Education, the Municipal Government of Shanghai and National Science Foundation of China. Shanghai Jiao Tong University is retained and approved by the government to operate the new Institute as its contractor and trustee. The official director of the institute is Prof. Frank Wilczek (Professor of MIT, USA; Nobel Prize in Physics 2004) supporting world-class fundamental physics research in high energy physics, astrophysics and quantum physics.&nbsp;<strong>English is the working language at the institute. TDLI has an international working environment and provides diversified culture experiences. Non-Chinese-speaking candidates are equally highly encouraged to apply.</strong></div><div><br></div><div><strong>TDLI aims for establishing a top-notch physics research institute that is similar to the Niels Bohr Institute at Copenhagen and Institute of Advanced Studies at Princeton. The central government has strongly committed to this endeavor.</strong>&nbsp;The Institute aims to undertake three basic missions: 1) provides a platform to foster academic training, exchange, and collaborations for worldwide physicists; 2) hosts cutting-edge research programs on most fundamental questions in particle physics, cosmology and quantum physics with potential expansion to include other related areas such as the application of quantum mechanics to bioprocesses; 3) actively engages in general public science education.</div><div><br></div><div><strong>Applicants should submit a CV, a brief research statement, a list of publications and at least three letters of recommendation to:</strong></div><div>atlas-china-sjtu-faculty@cern.ch</div><div><strong>Please put “ATLAS Postdoc Application: YOUR_NAME” as the identifier in the email subject.</strong></div><div><br></div><div><strong>For full consideration, applications should be received by Feb. 29, 2019. The position will remain open till filled. In case of inquiries for more info, please feel free to contact: Profs. </strong>Jun Guo, Kim Siang Khaw, Liang Li, Shu Li, Kun Liu, Weihao Wu, Haijun Yang, Ning Zhou</div>',
        "_collections": ["Jobs"],
        "contact_details": [
            {
                "name": "Liu, Kun",
                "email": "kun.liu@sjtu.edu.cn",
                "record": {"$ref": "https://labs.inspirehep.net/api/authors/1081452"},
            }
        ],
        "arxiv_categories": [
            "hep-ex",
            "hep-th",
            "nucl-ex",
            "physics.ins-det",
            "astro-ph",
        ],
    }

    non_relevant_job_data = {
        "ranks": ["POSTDOC"],
        "status": "closed",
        "$schema": "https://labs.inspirehep.net/api/schemas/records/jobs.json",
        "regions": ["Asia"],
        "position": "ATLAS Postdoctoral Research Fellow at Pung-Dao Lee Institute",
        "description": '<div><strong>The Particle Physics Division (PD) at Tsung-Dao Lee Institute (TDLI)</strong>&nbsp;and&nbsp;<strong>Institute for Nuclear and Particle Physics (INPAC) at Shanghai Jiao Tong University (SJTU)</strong>, China invite applications for postdoctoral researcher positions to work on ATLAS experiment at LHC, CERN. We welcome highly motivated applicants who have obtained a Ph.D. degree or who are expecting one prior to starting the position, in nuclear physics, particle physics, or a related field. The initial appointment is for 2 years with possible renewal based on mutual satisfaction (up to 5 year maximum). PD@TDLI and INPAC@SJTU offer competitive salary commensurate with qualifications and subsidized housing options through the university. We will also encourage promising candidates in applying for the prestigious&nbsp;<strong>"Tsung-Dao Lee Postdoctoral Fellowship" and “Chung-Yao Chao Postdoctoral Fellowship” for additional benefits.</strong></div><div><br></div><div><strong>The successful candidate will participate in ATLAS experiment at CERN and with good opportunities to be based at CERN</strong>, and also has chance to travel to and work in Shanghai if needed. The appointee will be expected to make major contributions to ATLAS Run2/Run3 data analysis related to property measurements of the Higgs boson, searches for new physics beyond the Standard Model, Standard Model electroweak multi-boson physics, and top quark physics. The hardware experience with high granularity analogue/digital calorimeters, muon spectrometer, and silicon detectors will be advantageous.</div><div><br></div><div><strong>TDLI is a newly established prestigious national research institute in China, initiated by Prof. Tsung-Dao Lee</strong>&nbsp;(University Professor Emeritus at Columbia Univ., USA; Nobel Prize in Physics 1957, Albert Einstein Award 1957), directly approved by China’s Central Government, co-funded by Ministry of Science and Technology, the Ministry of Education, the Municipal Government of Shanghai and National Science Foundation of China. Shanghai Jiao Tong University is retained and approved by the government to operate the new Institute as its contractor and trustee. The official director of the institute is Prof. Frank Wilczek (Professor of MIT, USA; Nobel Prize in Physics 2004) supporting world-class fundamental physics research in high energy physics, astrophysics and quantum physics.&nbsp;<strong>English is the working language at the institute. TDLI has an international working environment and provides diversified culture experiences. Non-Chinese-speaking candidates are equally highly encouraged to apply.</strong></div><div><br></div><div><strong>TDLI aims for establishing a top-notch physics research institute that is similar to the Niels Bohr Institute at Copenhagen and Institute of Advanced Studies at Princeton. The central government has strongly committed to this endeavor.</strong>&nbsp;The Institute aims to undertake three basic missions: 1) provides a platform to foster academic training, exchange, and collaborations for worldwide physicists; 2) hosts cutting-edge research programs on most fundamental questions in particle physics, cosmology and quantum physics with potential expansion to include other related areas such as the application of quantum mechanics to bioprocesses; 3) actively engages in general public science education.</div><div><br></div><div><strong>Applicants should submit a CV, a brief research statement, a list of publications and at least three letters of recommendation to:</strong></div><div>atlas-china-sjtu-faculty@cern.ch</div><div><strong>Please put “ATLAS Postdoc Application: YOUR_NAME” as the identifier in the email subject.</strong></div><div><br></div><div><strong>For full consideration, applications should be received by Feb. 29, 2019. The position will remain open till filled. In case of inquiries for more info, please feel free to contact: Profs. </strong>Jun Guo, Kim Siang Khaw, Liang Li, Shu Li, Kun Liu, Weihao Wu, Haijun Yang, Ning Zhou</div>',
        "_collections": ["Jobs"],
        "contact_details": [
            {
                "name": "Zhou, Ning",
                "email": "nzhou@sjtu.edu.cn",
                "record": {"$ref": "https://labs.inspirehep.net/api/authors/1060979"},
            }
        ],
        "arxiv_categories": [
            "hep-ex",
            "hep-th",
            "nucl-ex",
            "physics.ins-det",
            "astro-ph",
        ],
    }

    relevant_record = create_record("job", relevant_job_data)
    create_record("job", non_relevant_job_data)
    path = "contact_details.record.$ref"
    collection = "jobs"
    inspire_index = "records-jobs"
    record_ref = "https://labs.inspirehep.net/api/authors/1081452"
    query = get_query_for_given_path(collection, path, record_ref)
    matched_records = InspireSearch(index=inspire_index).query(query).execute()
    assert len(matched_records) == 1
    assert matched_records[0].control_number == relevant_record["control_number"]
