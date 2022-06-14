// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../common/http.ts';

export default function subscribeJobMailingList(formData: any) {
  return http.post('/mailing/subscribe/jobs/weekly', formData);
}
