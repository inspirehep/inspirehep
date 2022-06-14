import { string } from 'yup';
import isValidOrcid from 'is-valid-orcid';

function isValidOrcidOrNull(value) {
  return value == null ? true : isValidOrcid(value);
}
export default function orcid(validationMessage = 'Not a valid ORCID') {
  return string()
    .trim()
    .test('orcid', validationMessage, isValidOrcidOrNull);
}
