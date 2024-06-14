export const authToken = {
  headers: {
    Authorization: `Token ${process.env.DJANGO_READ_API_TOKEN || ''}`,
  },
};
