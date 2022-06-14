// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string } from 'yup';

function encodeUriIfNotEncoded(value: any) {
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
