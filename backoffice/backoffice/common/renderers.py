from rest_framework.renderers import BrowsableAPIRenderer, JSONRenderer

from backoffice.common.serializers import BaseBackofficeSearchUISerializer
from backoffice.common.constants import APPLICATION_VND_INSPIREHEP_JSON


class BackofficeUIRenderer(JSONRenderer):
    media_type = APPLICATION_VND_INSPIREHEP_JSON
    format = "backoffice-json"
    serializer_class = BaseBackofficeSearchUISerializer

    def render(self, data, accepted_media_type=None, renderer_context=None):
        data = self.serializer_class(data).data
        return super().render(data, accepted_media_type, renderer_context)


class BackofficeUIBrowsableRenderer(BrowsableAPIRenderer):
    format = "backoffice-ui"
    serializer_class = BaseBackofficeSearchUISerializer

    def get_context(self, data, accepted_media_type, renderer_context):
        data = self.serializer_class(data).data
        return super().get_context(data, accepted_media_type, renderer_context)
