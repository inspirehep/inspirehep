import http from '../common/http';

export default async function(format: any, recordId: any) {
  const response = await http.get(`/literature/${recordId}`, {
    headers: {
      Accept: format,
    },
  });
  return response.data;
}
