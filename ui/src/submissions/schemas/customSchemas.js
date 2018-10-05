import { object, lazy, string, number } from 'yup';
import isValidOrcid from 'is-valid-orcid';
import { isEmptyObjectShallow } from '../../common/utils';

export function emptyObjectOrShapeOf(shape) {
  return lazy(value => {
    if (isEmptyObjectShallow(value)) {
      return object();
    }
    return object().shape(shape);
  });
}

function isValidOrcidOrNull(value) {
  return value == null ? true : isValidOrcid(value);
}
export function orcid(validationMessage = 'Not a valid ORCID') {
  return string()
    .trim()
    .test('orcid', validationMessage, isValidOrcidOrNull);
}

export function year() {
  return number()
    .integer()
    .min(1000)
    .max(2050)
    .transform(
      (currentValue, originalValue) =>
        originalValue === '' ? undefined : currentValue
    );
}
