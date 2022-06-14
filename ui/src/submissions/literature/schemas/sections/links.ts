import { string } from 'yup';

function encodeUriIfNotEncoded(value) {
  const decodedUri = decodeURI(value);
  const isUriEncoded = decodedUri === value;
  if (isUriEncoded) {
    return encodeURI(value);
  }
  return value;
}

export default {
  pdf_link: string().url().transform(encodeUriIfNotEncoded),
  additional_link: string().url().transform(encodeUriIfNotEncoded),
};
