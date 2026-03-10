from backoffice.common.renderers import (
    BackofficeUIBrowsableRenderer,
    BackofficeUIRenderer,
)
from backoffice.hep.api.serializers import HepBackofficeSearchUISerializer


class HepBackofficeUIRenderer(BackofficeUIRenderer):
    serializer_class = HepBackofficeSearchUISerializer


class HepBackofficeUIBrowsableRenderer(BackofficeUIBrowsableRenderer):
    serializer_class = HepBackofficeSearchUISerializer
