import http from '../common/http';

export default function subscribeJobMailingList(formData) {
  return http.post('/mailing/subscribe/jobs/weekly', formData);
}
