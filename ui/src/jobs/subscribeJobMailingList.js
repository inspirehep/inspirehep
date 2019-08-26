import http from '../common/http';

export default function subscribeJobMailingList({
  email,
  firstName,
  lastName,
}) {
  return http.post('/mailing/subscribe/jobs/weekly', {
    email,
    first_name: firstName,
    last_name: lastName,
  });
}
