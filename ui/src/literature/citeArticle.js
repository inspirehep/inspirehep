import http from '../common/http';

export default async function (format, recordId) {
  const response = await http.get(`/literature/${recordId}`, {
    headers: {
      Accept: format,
    },
  });
  return response.data;
}
