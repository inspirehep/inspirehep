"""
With these settings, tests run faster.
"""

from .base import *  # noqa
from .base import env

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#secret-key
SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="0GcuNOm9KXvazfJKLWYOoTSIBznjRNj3qfioFMKtHBow8Sv7hOmjkBbOBRZDGZy2",
)
ALLOWED_HOSTS = ["127.0.0.1"]

# https://docs.djangoproject.com/en/dev/ref/settings/#test-runner
TEST_RUNNER = "django.test.runner.DiscoverRunner"

# PASSWORDS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#password-hashers
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# DEBUGGING FOR TEMPLATES
# ------------------------------------------------------------------------------
TEMPLATES[0]["OPTIONS"]["debug"] = True  # type: ignore # noqa: F405

# MEDIA
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#media-url
MEDIA_URL = "http://media.testserver"
# Opensearch
# ------------------------------------------------------------------------------
# Name of the Opensearch index
OPENSEARCH_INDEX_NAMES = {
    "backoffice.workflows.documents": "backoffice-backend-test-workflows",
}
# Force an index refresh with every save.
OPENSEARCH_DSL_AUTO_REFRESH = True

OPENSEARCH_DSL = {
    "default": {
        "hosts": [env("OPENSEARCH_HOST")],
        "use_ssl": False,
        "verify_certs": False,
        "timeout": 30,
    },
}

