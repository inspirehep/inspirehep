import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
});

export default http;

export const UI_SERIALIZER_REQUEST_OPTIONS = {
  headers: {
    Accept: 'application/vnd+inspire.record.ui+json',
  },
};
