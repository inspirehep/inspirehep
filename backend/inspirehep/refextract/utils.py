import redis
import structlog
from flask import current_app
from invenio_records.models import RecordMetadata
from sqlalchemy import cast, not_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from inspirehep.matcher.utils import normalize_title

LOGGER = structlog.getLogger()
JOURNAL_DICT_REDIS_EXPIRATION_PERIOD = 60 * 60


def create_journal_dict():
    """
    Returns a dictionary that is populated with refextracts's journal KB from the database.

        { SOURCE: DESTINATION }

    which represents that ``SOURCE`` is translated to ``DESTINATION`` when found.

    Note that refextract expects ``SOURCE`` to be normalized, which means removing
    all non alphanumeric characters, collapsing all contiguous whitespace to one
    space and uppercasing the resulting string.
    """
    only_journals = type_coerce(RecordMetadata.json, JSONB)["_collections"].contains(
        ["Journals"]
    )
    only_not_deleted = not_(
        type_coerce(RecordMetadata.json, JSONB).has_key("deleted")  # noqa
    ) | not_(  # noqa
        type_coerce(RecordMetadata.json, JSONB)["deleted"] == cast(True, JSONB)
    )
    entity_short_title = RecordMetadata.json["short_title"]
    entity_journal_title = RecordMetadata.json["journal_title"]["title"]
    entity_title_variants = RecordMetadata.json["title_variants"]

    titles_query = RecordMetadata.query.with_entities(
        entity_short_title, entity_journal_title
    ).filter(only_journals, only_not_deleted)

    title_variants_query = RecordMetadata.query.with_entities(
        entity_short_title, entity_title_variants
    ).filter(only_journals, only_not_deleted)

    title_dict = {}

    for (short_title, journal_title) in titles_query.all():
        title_dict[normalize_title(short_title)] = short_title
        title_dict[normalize_title(journal_title)] = short_title

    for (short_title, title_variants) in title_variants_query.all():
        if title_variants is None:
            continue

        sub_dict = {
            normalize_title(title_variant): short_title
            for title_variant in title_variants
        }

        title_dict.update(sub_dict)

    return title_dict


def _write_journal_kb_dict_to_redis(redis):
    journal_dict = create_journal_dict()
    LOGGER.info("Writing journal KB dict to redis")
    redis.hmset("refextract_journal_kb", journal_dict)
    redis.expire("refextract_journal_kb", JOURNAL_DICT_REDIS_EXPIRATION_PERIOD)

    return journal_dict


def get_journal_kb_dict():
    redis_url = current_app.config.get("CACHE_REDIS_URL")
    r = redis.StrictRedis.from_url(redis_url, decode_responses=True)
    journal_dict = _get_journal_kb_dict(r)
    if not journal_dict:
        journal_dict = _write_journal_kb_dict_to_redis(r)
    return journal_dict


def _get_journal_kb_dict(redis):
    journal_dict = redis.hgetall("refextract_journal_kb")
    return journal_dict
