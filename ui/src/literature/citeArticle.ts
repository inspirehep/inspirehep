// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../common/http.ts';

export default async function(format: any, recordId: any) {
  const response = await http.get(`/literature/${recordId}`, {
    headers: {
      Accept: format,
    },
  });
  return response.data;
}
