import http from '../common/http';

export default function subscribeJobMailingList({
  email,
  firstName,
  lastName,
}) {
  // TODO: change endpoint name
  return http.post('/mailing/subscribe/jobs', {
    email,
    first_name: firstName,
    last_name: lastName,
  });
}
