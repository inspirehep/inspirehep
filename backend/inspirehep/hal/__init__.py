import logging
import os

import structlog

LOGGER = structlog.getLogger()

sword_logging_level = os.environ.get("SWORD2_LOGGING_LEVEL")
if sword_logging_level:
    LOGGER.info(
        "Setting sword2.connection logger to specified level",
        new_level=sword_logging_level,
    )
    sword_logging_level = getattr(logging, sword_logging_level, "ERROR")
    logging.getLogger("sword2.connection").setLevel(sword_logging_level)
