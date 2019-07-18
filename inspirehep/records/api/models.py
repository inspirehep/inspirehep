from invenio_db import db
from sqlalchemy import Column, Integer, String
from sqlalchemy_utils import UUIDType


class TemporaryPidStore(db.Model):
    """Temporary table for pid types and pid values.

    It is created with a hook to truncate all its content commit.
    """
    __tablename__ = 'temporary_pidstore'
    __table_args__ = {
        'prefixes': ['TEMPORARY'],
        'postgresql_on_commit': 'DELETE ROWS'
    }
    id = Column(UUIDType, primary_key=True)
    pid_type = Column(String(10))
    pid_value = Column(String(25))
