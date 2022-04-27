import redis
from flask import current_app
from helpers.utils import create_record

from inspirehep.refextract.utils import create_journal_dict, get_journal_kb_dict


def test_create_journal_dict(inspire_app):
    data = {
        "journal_title": {"title": "Journal of Physical Science and Application"},
        "short_title": "J.Phys.Sci.Appl.",
        "title_variants": ["PHYS SCI APPL"],
    }
    create_record("jou", data=data)

    data = {
        "journal_title": {"title": "Image and Vision Computing"},
        "short_title": "Image Vision Comput.",
        "title_variants": ["IMAGE VISION COMPUT", "IMAGE VISION - COMPUTING"],
    }
    create_record("jou", data=data)

    data = {
        "journal_title": {"title": "Deleted journal title"},
        "short_title": "Deleted journal title",
        "title_variants": ["Deleted journal title", "Del. jou. title"],
        "deleted": True,
    }
    create_record("jou", data=data)

    expected = {
        "J PHYS SCI APPL": "J.Phys.Sci.Appl.",
        "JOURNAL OF PHYSICAL SCIENCE AND APPLICATION": "J.Phys.Sci.Appl.",
        "PHYS SCI APPL": "J.Phys.Sci.Appl.",
        "IMAGE VISION COMPUT": "Image Vision Comput.",
        "IMAGE AND VISION COMPUTING": "Image Vision Comput.",
        "IMAGE VISION COMPUTING": "Image Vision Comput.",
    }

    result = create_journal_dict()

    assert expected == result


def test_get_journal_kb_dict_writes_journal_dict_to_redis_if_not_present(
    inspire_app, clean_redis_journal_dict
):
    create_record(
        "jou",
        data={
            "journal_title": {"title": "Philosophy and Foundations of Physics"},
        },
    )
    redis_url = current_app.config.get("CACHE_REDIS_URL")
    r = redis.StrictRedis.from_url(redis_url, decode_responses=True)
    assert not r.hgetall("refextract_journal_kb")
    journal_dict = get_journal_kb_dict()
    assert journal_dict
    assert r.hgetall("refextract_journal_kb")
