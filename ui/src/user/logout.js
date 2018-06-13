import axios from 'axios';

export default async function() {
  return axios.get('/logout');
}
