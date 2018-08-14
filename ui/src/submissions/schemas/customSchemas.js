import { object, lazy, string } from 'yup';
import isValidOrcid from 'is-valid-orcid';

export function emptyObjectOrShapeOf(shape) {
  return lazy(value => {
    if (value && Object.keys(value).length === 0) {
      return object();
    }
    return object().shape(shape);
  });
}

function isValidOrcidOrNull(value) {
  return value == null ? true : isValidOrcid(value);
}
export function orcid(validationMessage = 'Not a valid ORCID') {
  return string().test('orcid', validationMessage, isValidOrcidOrNull);
}
