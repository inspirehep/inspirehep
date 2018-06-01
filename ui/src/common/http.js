import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/vnd+inspire.record.ui+json',
  },
});

export default http;
