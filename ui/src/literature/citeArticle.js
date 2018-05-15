import http from '../common/http';


export default async function (format, recordId) {
  try {
    const response = await http.get(`/literature/${recordId}`, {
      headers: {
        Accept: `application/x-${format}`,
      },
    });
    return response.data;
  } catch (error) {
    return `nothing for format: ${format}`;
  }
}
