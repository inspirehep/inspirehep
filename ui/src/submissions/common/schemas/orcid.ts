// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string } from 'yup';
import isValidOrcid from 'is-valid-orcid';

function isValidOrcidOrNull(value: any) {
  return value == null ? true : isValidOrcid(value);
}
export default function orcid(validationMessage = 'Not a valid ORCID') {
  return string()
    .trim()
    .test('orcid', validationMessage, isValidOrcidOrNull);
}
