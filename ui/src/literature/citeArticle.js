import http from '../common/http';

export default async function(format, recordId) {
  try {
    const response = await http.get(`/literature/${recordId}`, {
      headers: {
        Accept: `application/${format}`,
      },
    });
    return response.data;
  } catch (error) {
    // TODO: handle error better (differentiate 406, 500, network error)
    return 'Not supported yet :(';
  }
}
