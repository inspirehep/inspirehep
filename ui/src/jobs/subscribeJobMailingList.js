import http from '../common/http.ts';

export default function subscribeJobMailingList(formData) {
  return http.post('/mailing/subscribe/jobs/weekly', formData);
}
